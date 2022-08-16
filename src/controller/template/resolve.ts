import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '../../specification/service-template'
import {InputAssignmentMap} from '../../specification/topology-template'
import {Instance} from '../../repository/instances'
import * as files from '../../utils/files'
import {VariabilityExpression} from '../../specification/variability'
import * as utils from '../../utils/utils'
import * as validator from '../../utils/validator'

export type TemplateResolveArguments = {
    instance?: string
    template?: string
    preset?: string
    inputs?: string
    output?: string
}

export default function (options: TemplateResolveArguments) {
    let instance: Instance | undefined
    if (options.instance) instance = new Instance(options.instance)

    let template = options.template
    if (instance) template = instance.getVariableServiceTemplatePath()
    if (!template) throw new Error('Either instance or template must be set')

    let output = options.output
    if (instance) output = instance.generateServiceTemplatePath()
    if (!output) throw new Error('Either instance or output must be set')

    // Load service template
    const resolver = new VariabilityResolver(files.loadFile<ServiceTemplate>(template))
        .setVariabilityPreset(options.preset)
        .setVariabilityInputs(options.inputs ? files.loadFile<InputAssignmentMap>(options.inputs) : {})

    // Ensure correct TOSCA definitions version
    resolver.ensureCompatibility()

    // Resolve variability
    resolver.resolve()

    // Check consistency
    resolver.checkConsistency()

    // Transform to TOSCA compliant format
    const service = resolver.transform()
    files.storeFile(output, service)
}

type Element = {
    name: string
    present?: boolean
    conditions: VariabilityExpression[]
    groups: Group[]
}

type Node = Element & {
    relations: Relation[]
}

type Relation = Element & {
    source: string
    target: string
}

type Group = {
    name: string
    conditions: VariabilityExpression[]
}

export class VariabilityResolver {
    private readonly _serviceTemplate: ServiceTemplate

    private _variabilityInputs?: InputAssignmentMap

    private nodes: Node[] = []
    private nodesMap: {[name: string]: Node} = {}
    private relations: Relation[] = []
    private relationships: {[name: string]: Relation[]} = {}

    constructor(serviceTemplate: ServiceTemplate) {
        this._serviceTemplate = utils.deepCopy(serviceTemplate)

        Object.keys(serviceTemplate.topology_template?.relationship_templates || {}).forEach(
            name => (this.relationships[name] = [])
        )

        Object.entries(serviceTemplate.topology_template?.node_templates || {}).forEach(([nodeName, nodeTemplate]) => {
            const node: Node = {
                name: nodeName,
                conditions: utils.toList(nodeTemplate.conditions),
                relations: [],
                groups: [],
            }
            this.nodes.push(node)
            this.nodesMap[nodeName] = node

            nodeTemplate.requirements?.forEach(map => {
                const relationName = utils.firstKey(map)
                const assignment = utils.firstValue(map)
                const target = validator.isString(assignment) ? assignment : assignment.node
                const condition = validator.isString(assignment) ? [true] : utils.toList(assignment.conditions)

                const relation: Relation = {
                    name: relationName,
                    source: nodeName,
                    target,
                    conditions: condition,
                    groups: [],
                }
                this.relations.push(relation)
                node.relations.push(relation)

                if (!validator.isString(assignment)) {
                    if (validator.isString(assignment.relationship)) {
                        const relationship = this.relationships[assignment.relationship]
                        if (validator.isUndefined(relationship))
                            throw new Error(
                                `Relationship "${assignment.relationship}" of relation "${relationName}" of node "${nodeName}" does not exist!`
                            )

                        relationship.push(relation)
                    }
                }
            })
        })

        // Ensure that each relationship is at least used in one relation
        for (const relationship of Object.entries(this.relationships)) {
            if (relationship[1].length === 0) throw new Error(`Relationship "${relationship[0]}" is never used`)
        }

        Object.entries(serviceTemplate.topology_template?.groups || {}).forEach(([groupName, groupTemplate]) => {
            if (groupTemplate.conditions === undefined) return

            const group: Group = {
                name: groupName,
                conditions: utils.toList(groupTemplate.conditions),
            }

            groupTemplate.members.forEach(member => {
                if (validator.isString(member)) {
                    this.nodesMap[member]?.groups.push(group)
                } else {
                    if (validator.isString(member[1])) {
                        this.nodesMap[member[0]]?.relations.forEach(relation => {
                            if (relation.name === member[1]) relation.groups.push(group)
                        })
                    }

                    if (validator.isNumber(member[1])) {
                        this.nodesMap[member[0]]?.relations[member[1]]?.groups.push(group)
                    }
                }
            })
        })
    }

    resolve() {
        for (const node of this.nodes) {
            node.present = this.checkPresence(node)
        }

        for (const relation of this.relations) {
            relation.present = this.checkPresence(relation)
        }

        return this
    }

    checkPresence(element: Element) {
        const conditions = element.conditions
        element.groups.forEach(group => conditions.push(...group.conditions))
        return utils.filterNotNull(conditions).every(condition => this.evaluateVariabilityCondition(condition))
    }

    checkConsistency() {
        const relations = this.relations.filter(relation => relation.present)
        const nodes = this.nodes.filter(node => node.present)

        // Ensure that each relation source exists
        for (const relation of relations) {
            if (!this.nodesMap[relation.source]?.present)
                throw new Error(`Relation source "${relation.source}" of relation "${relation.name}" does not exist`)
        }

        // Ensure that each relation target exists
        for (const relation of relations) {
            if (!this.nodesMap[relation.target]?.present)
                throw new Error(`Relation target "${relation.target}" of relation "${relation.name}" does not exist`)
        }

        // Ensure that every component has at maximum one hosting relation
        for (const node of nodes) {
            const relations = node.relations.filter(
                relation => relation.source === node.name && relation.name === 'host' && relation.present
            )
            if (relations.length > 1) throw new Error(`Node "${node.name}" has more than one hosting relations`)
        }

        // Ensure that every component that had a hosting relation previously still has one
        for (const node of nodes) {
            const relations = node.relations.filter(
                relation => relation.source === node.name && relation.name === 'host'
            )

            if (relations.length !== 0 && !relations.some(relation => relation.present))
                throw new Error(`Node "${node.name}" requires a hosting relation`)
        }
        return this
    }

    transform() {
        // Deep copy original service template
        const serviceTemplate = utils.deepCopy(this._serviceTemplate)

        // Set TOSCA definitions version
        serviceTemplate.tosca_definitions_version = TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3

        // Delete variability definition
        delete serviceTemplate.topology_template?.variability

        // Delete node templates which are not present
        Object.entries(serviceTemplate.topology_template?.node_templates || {}).forEach(([nodeName, nodeTemplate]) => {
            const node = this.nodesMap[nodeName]
            if (node.present) {
                delete serviceTemplate.topology_template.node_templates[nodeName].conditions
            } else {
                delete serviceTemplate.topology_template.node_templates[nodeName]
            }

            // Delete requirement assignment which are not present
            nodeTemplate.requirements = nodeTemplate.requirements?.filter((map, index) => {
                const assignment = utils.firstValue(map)
                if (!validator.isString(assignment)) delete assignment.conditions
                return node.relations[index].present
            })
        })

        // Delete all relationship templates which have no present relations
        Object.keys(serviceTemplate.topology_template?.relationship_templates || {}).forEach(name => {
            if (this.relationships[name].every(relation => !relation.present))
                delete serviceTemplate.topology_template.relationship_templates[name]
        })

        // Delete all groups that have conditions assigned
        Object.entries(serviceTemplate.topology_template?.groups || {}).forEach(([name, template]) => {
            if (template.conditions == undefined) return
            delete serviceTemplate.topology_template?.groups[name]
        })

        return serviceTemplate
    }

    ensureCompatibility() {
        if (
            ![
                TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
                TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            ].includes(this._serviceTemplate.tosca_definitions_version)
        )
            throw new Error('Unsupported TOSCA definitions version')
    }

    setVariabilityPreset(name?: string) {
        if (validator.isUndefined(name)) return this
        this._variabilityInputs = this.getVariabilityPreset(name).inputs
        return this
    }

    setVariabilityInputs(inputs: InputAssignmentMap) {
        this._variabilityInputs = {...this._variabilityInputs, ...inputs}
        return this
    }

    getVariabilityInput(name: string) {
        const input = this._variabilityInputs?.[name]
        if (validator.isUndefined(input)) throw new Error(`Did not find variability input ${name}`)
        return input
    }

    getVariabilityPreset(name: string) {
        const set = this._serviceTemplate.topology_template?.variability?.presets[name]
        if (validator.isUndefined(set)) throw new Error(`Did not find variability set ${name}`)
        return set
    }

    getVariabilityExpression(name: string) {
        const condition = this._serviceTemplate.topology_template?.variability?.expressions[name]
        if (validator.isUndefined(condition)) throw new Error(`Did not find variability expression ${name}`)
        return condition
    }

    evaluateVariabilityCondition(condition: VariabilityExpression): boolean {
        const result = this.evaluateVariabilityConditionRunner(condition)
        validator.ensureBoolean(result)
        return result
    }

    evaluateVariabilityConditionRunner(
        condition: VariabilityExpression
    ): boolean | string | number | VariabilityExpression {
        if (validator.isUndefined(condition)) throw new Error(`Received condition that is undefined or null`)
        if (validator.isString(condition)) return condition
        if (validator.isBoolean(condition)) return condition
        if (validator.isNumber(condition)) return condition

        // TODO: cache results
        if (validator.hasProperty(condition, 'cached_result')) {
            return condition.cached_result
        }

        if (validator.hasProperty(condition, 'and')) {
            return condition.and.every(element => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureBoolean(value)
                return value
            })
        }

        if (validator.hasProperty(condition, 'or')) {
            return condition.or.some(element => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureBoolean(value)
                return value
            })
        }

        if (validator.hasProperty(condition, 'not')) {
            const value = this.evaluateVariabilityConditionRunner(condition.not)
            validator.ensureBoolean(value)
            return !value
        }

        if (validator.hasProperty(condition, 'xor')) {
            return (
                condition.xor.reduce((count: number, element) => {
                    const value = this.evaluateVariabilityConditionRunner(element)
                    validator.ensureBoolean(value)
                    if (value) count++
                    return count
                }, 0) === 1
            )
        }

        if (validator.hasProperty(condition, 'implies')) {
            const first = this.evaluateVariabilityConditionRunner(condition.implies[0])
            validator.ensureBoolean(first)

            const second = this.evaluateVariabilityConditionRunner(condition.implies[1])
            validator.ensureBoolean(first)

            return first ? second : true
        }

        if (validator.hasProperty(condition, 'add')) {
            return condition.add.reduce((sum: number, element) => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureNumber(value)
                return sum + value
            }, 0)
        }

        if (validator.hasProperty(condition, 'sub')) {
            const first = this.evaluateVariabilityConditionRunner(condition.sub[0])
            validator.ensureNumber(first)

            return condition.sub.slice(1).reduce((difference: number, element) => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureNumber(value)
                return difference - value
            }, first)
        }

        if (validator.hasProperty(condition, 'mul')) {
            return condition.mul.reduce((product: number, element) => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureNumber(value)
                return product * value
            }, 1)
        }

        if (validator.hasProperty(condition, 'div')) {
            const first = this.evaluateVariabilityConditionRunner(condition.div[0])
            validator.ensureNumber(first)

            return condition.div.slice(1).reduce((quotient: number, element) => {
                const value = this.evaluateVariabilityConditionRunner(element)
                validator.ensureNumber(value)
                return quotient / value
            }, first)
        }

        if (validator.hasProperty(condition, 'mod')) {
            const first = this.evaluateVariabilityConditionRunner(condition.mod[0])
            validator.ensureNumber(first)

            const second = this.evaluateVariabilityConditionRunner(condition.mod[1])
            validator.ensureNumber(second)

            return first % second
        }

        if (validator.hasProperty(condition, 'get_variability_input')) {
            validator.ensureString(condition.get_variability_input)
            return this.evaluateVariabilityConditionRunner(this.getVariabilityInput(condition.get_variability_input))
        }

        if (validator.hasProperty(condition, 'get_variability_expression')) {
            validator.ensureString(condition.get_variability_expression)
            return this.evaluateVariabilityConditionRunner(
                this.getVariabilityExpression(condition.get_variability_expression)
            )
        }

        if (validator.hasProperty(condition, 'get_variability_condition')) {
            validator.ensureString(condition.get_variability_condition)
            return this.evaluateVariabilityCondition(this.getVariabilityExpression(condition.get_variability_condition))
        }

        if (validator.hasProperty(condition, 'concat')) {
            return condition.concat.map(c => this.evaluateVariabilityConditionRunner(c)).join('')
        }

        if (validator.hasProperty(condition, 'join')) {
            return condition.join[0].map(c => this.evaluateVariabilityConditionRunner(c)).join(condition.join[1])
        }

        if (validator.hasProperty(condition, 'token')) {
            const element = this.evaluateVariabilityConditionRunner(condition.token[0])
            validator.ensureString(element)
            const token = condition.token[1]
            const index = condition.token[2]
            return element.split(token)[index]
        }

        if (validator.hasProperty(condition, 'equal')) {
            const first = this.evaluateVariabilityConditionRunner(condition.equal[0])
            return condition.equal.every(element => {
                const value = this.evaluateVariabilityConditionRunner(element)
                return value === first
            })
        }

        if (validator.hasProperty(condition, 'greater_than')) {
            return (
                this.evaluateVariabilityConditionRunner(condition.greater_than[0]) >
                this.evaluateVariabilityConditionRunner(condition.greater_than[1])
            )
        }

        if (validator.hasProperty(condition, 'greater_or_equal')) {
            return (
                this.evaluateVariabilityConditionRunner(condition.greater_or_equal[0]) >=
                this.evaluateVariabilityConditionRunner(condition.greater_or_equal[1])
            )
        }

        if (validator.hasProperty(condition, 'less_than')) {
            return (
                this.evaluateVariabilityConditionRunner(condition.less_than[0]) <
                this.evaluateVariabilityConditionRunner(condition.less_than[1])
            )
        }

        if (validator.hasProperty(condition, 'less_or_equal')) {
            return (
                this.evaluateVariabilityConditionRunner(condition.less_or_equal[0]) <=
                this.evaluateVariabilityConditionRunner(condition.less_or_equal[1])
            )
        }

        if (validator.hasProperty(condition, 'in_range')) {
            const element = this.evaluateVariabilityConditionRunner(condition.in_range[0])
            const lower = condition.in_range[1][0]
            const upper = condition.in_range[1][1]
            return lower <= element && element <= upper
        }

        if (validator.hasProperty(condition, 'valid_values')) {
            const element = this.evaluateVariabilityConditionRunner(condition.valid_values[0])
            const valid = condition.valid_values[1].map(c => this.evaluateVariabilityConditionRunner(c))
            return valid.includes(element)
        }

        if (validator.hasProperty(condition, 'length')) {
            const element = this.evaluateVariabilityConditionRunner(condition.length[0])
            validator.ensureString(element)

            const length = this.evaluateVariabilityConditionRunner(condition.length[1])
            validator.ensureNumber(length)

            return element.length === length
        }

        if (validator.hasProperty(condition, 'min_length')) {
            const element = this.evaluateVariabilityConditionRunner(condition.min_length[0])
            validator.ensureString(element)

            const length = this.evaluateVariabilityConditionRunner(condition.min_length[1])
            validator.ensureNumber(length)

            return element.length >= length
        }

        if (validator.hasProperty(condition, 'max_length')) {
            const element = this.evaluateVariabilityConditionRunner(condition.max_length[0])
            validator.ensureString(element)

            const length = this.evaluateVariabilityConditionRunner(condition.max_length[1])
            validator.ensureNumber(length)

            return element.length <= length
        }

        throw new Error(`Unknown variability condition ${condition}`)
    }
}
