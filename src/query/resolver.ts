import {Parser} from './parser'
import {
    ConditionExpression,
    Expression,
    FromExpression,
    MatchExpression,
    NodeExpression,
    PredicateExpression,
    RelationshipExpression,
    ReturnExpression,
    SelectExpression,
    VariableExpression,
} from '#spec/query-type'
import {ServiceTemplate} from '#spec/service-template'
import {Graph} from './graph'
import {QueryTemplateArguments} from '#controller/query/execute'
import * as files from '../utils/files'
import {NodeTemplate, NodeTemplateMap} from '#spec/node-template'
import {getTemplates} from '#/query/utils'

export class Resolver {
    // Abstract representation of the relationships between node templates. Used to evaluate MATCH clauses
    private nodeGraph: Graph | undefined
    private currentTemplate: ServiceTemplate | undefined
    private source = ''
    // Since YAML doesn't have the concept of a parent, we need to store the keys separately so we can query for object names
    private currentKeys: string[] = []

    resolve(queryArgs: QueryTemplateArguments): {name: string; result: Object}[] {
        // If input is a file load it, otherwise use input string directly
        const queryString: string = files.isFile(queryArgs.query) ? files.loadFile(queryArgs.query) : queryArgs.query
        const parser = new Parser()
        let tree
        try {
            this.source = queryArgs.source
            tree = parser.getAST(queryString)
        } catch (e) {
            if (e instanceof Error) console.error(e.message)
            process.exit(1)
        }
        return this.evaluate(tree)
    }

    resolveFromTemplate(query: string, template: ServiceTemplate): Object {
        const parser = new Parser()
        let tree
        try {
            tree = parser.getAST(query, 'Select')
        } catch (e) {
            if (e instanceof Error) console.error(e.message)
            process.exit(1)
        }
        return this.evaluateSelect(template, tree)
    }

    /**
     * Function that takes an AST as input and returns the matching objects
     * @param expression The complete AST
     * @return result The data that matches the expression
     */
    private evaluate(expression: Expression): {name: string; result: Object}[] {
        const results = []
        const templates = this.evaluateFrom(expression.from)
        for (const t of templates) {
            let result: any = t.template
            this.currentTemplate = t.template
            if (expression.match != null) {
                result = this.evaluateMatch(result, expression.match)
            }
            try {
                result = this.evaluateSelect(result, expression.select)
            } catch (e) {
                if (e instanceof Error) console.error(e.message)
                result = null
            }
            // Discard empty results
            if (result && !(Array.isArray(result) && result.length == 0)) {
                // Flatten the result if it is only one element
                result = result.length == 1 ? result[0] : result
                results.push({name: t.name, result: result})
            }
        }
        return results
    }

    /** Loads the template or instance in the FROM clause */
    private evaluateFrom(expression: FromExpression): {name: string; template: ServiceTemplate}[] {
        let serviceTemplates: {name: string; template: ServiceTemplate}[] = []
        try {
            serviceTemplates = getTemplates(this.source, expression.type, expression.path)
        } catch (e: unknown) {
            console.error(`Could not locate service template ${expression.path} from source ${this.source}`)
            if (e instanceof Error) {
                console.error(e.message)
            }
        }
        return serviceTemplates
    }

    private evaluateSelect(data: Object, expression: SelectExpression): Object {
        const results = []
        for (const p of expression.path) {
            let result = data
            for (const i of p.steps) {
                if (i.type == 'Group') {
                    result = this.evaluateGroup(result, i.path)
                } else if (i.type == 'Policy') {
                    result = this.evaluatePolicy(result, i.path)
                } else if (i.path == '*') {
                    result = this.evaluateWildcard(result, i.condition)
                } else {
                    result = this.evaluateStep(result, i.path)
                }
            }
            if (p.returnVal) {
                result = this.evaluateReturn(result, p.returnVal)
            }
            results.push(result)
        }
        return results.length > 1 ? results : results[0]
    }

    private evaluateReturn(data: Object, returnVal: ReturnExpression): Object {
        if (Array.isArray(data)) {
            const resultArray: any[] = []
            let i = 0
            for (const obj of data) {
                const entry: any = {}
                for (const pair of returnVal.keyValuePairs) {
                    entry[this.evaluateVariable(pair.key, obj, i)] = this.evaluateVariable(pair.value, obj, i)
                }
                i++
                resultArray.push(entry)
            }
            return resultArray
        } else {
            const result: any = {}
            for (const pair of returnVal.keyValuePairs) {
                result[this.evaluateVariable(pair.key, data)] = this.evaluateVariable(pair.value, data)
            }
            return result
        }
    }

    private evaluateVariable(variable: VariableExpression, result: any, index?: number): any {
        return variable.isString ? variable.text : this.resolvePath(variable.text, result, index || 0)
    }

    private evaluateMatch(data: ServiceTemplate, expression: MatchExpression): {[name: string]: NodeTemplateMap} {
        this.nodeGraph = new Graph(data)
        this.currentKeys = Object.keys(data.topology_template?.node_templates || [])
        let paths = new Set<string[]>()
        // initialize our starting nodes by checking the condition
        for (const n of this.filterNodes(data, expression.nodes[0])) {
            paths.add([n])
        }
        // for each path, expand all relationships at last node and check if it fits filters
        if (expression.relationships) {
            for (let i = 0; i < expression.relationships.length; i++) {
                paths = this.expand(paths, expression.relationships[i], expression.nodes[i + 1]?.predicate)
            }
        }
        /*
        Paths only contain node names as strings, so in this step we create a new map of nodes for each alias variable
        defined in the query, then put the matching nodes in that array
         */
        const result: {[name: string]: NodeTemplateMap} = {}
        for (let i = 0; i < expression.nodes.length; i++) {
            const nodes = new Set<string>()
            for (const p of paths) nodes.add(p[i])
            const name = expression.nodes[i].name
            if (name) {
                result[name] = Resolver.getNodesByName(data, [...nodes])
            }
        }
        return result
    }

    /**
     * Traverses all relationships of a given node to find neighbors
     * @param paths The current set of viable paths, expansion will start from the last node
     * @param relationship Direction and optional conditions of relationships
     * @param nodePredicate Predicate, if any
     */
    private expand(
        paths: Set<string[]>,
        relationship: RelationshipExpression,
        nodePredicate: PredicateExpression | undefined
    ): Set<string[]> {
        const newPaths = new Set<string[]>()
        for (const p of paths) {
            // do a breadth first search to find all nodes reachable within n steps
            const targets = this.nodeGraph?.limitedBFS(
                p[p.length - 1],
                relationship?.cardinality?.min || 1,
                relationship?.cardinality?.max || 1,
                relationship.direction,
                relationship.predicate
            )
            // if a predicate is specified, filter out nodes which do not satisfy it
            for (const n of targets || []) {
                if (
                    !nodePredicate ||
                    (this.nodeGraph?.getNode(n)?.data &&
                        this.evaluatePredicate(n, this.nodeGraph?.getNode(n)?.data || {}, nodePredicate))
                ) {
                    newPaths.add(p.concat(n))
                }
            }
        }
        return newPaths
    }

    /**
     * Gets a node expression as input and returns a string list of node template names that match
     */
    private filterNodes(data: ServiceTemplate, expression: NodeExpression): string[] {
        let result: string[] = []
        const nodes = data.topology_template?.node_templates || {}
        if (expression.predicate) {
            for (const [key, value] of Object.entries(nodes)) {
                if (this.evaluatePredicate(key, value, expression.predicate)) {
                    result.push(key)
                }
            }
        } else {
            result = Object.keys(nodes)
        }
        return result
    }

    private evaluatePredicate(key: string, data: Object, predicate: PredicateExpression): boolean {
        const {a, operator, b} = predicate
        if (operator == null) {
            return this.evaluateCondition(key, data, a as ConditionExpression)
        } else if (operator == 'AND') {
            return (
                this.evaluatePredicate(key, data, a as PredicateExpression) &&
                this.evaluatePredicate(key, data, b as PredicateExpression)
            )
        } else if (operator == 'OR') {
            return (
                this.evaluatePredicate(key, data, a as PredicateExpression) ||
                this.evaluatePredicate(key, data, b as PredicateExpression)
            )
        }
        return false
    }

    private evaluateCondition(key: string, data: Object, condition: ConditionExpression): boolean {
        const {variable, value, operator} = condition
        if (condition.type == 'Existence') {
            const exists = this.resolvePath(variable, data) != null
            return condition.negation ? !exists : exists
        }
        if (condition.variable == 'name') {
            if (condition.operator == '=') {
                return condition.negation ? condition.value != key : condition.value == key
            } else {
                if (value) return condition.negation ? !new RegExp(value).test(key) : new RegExp(value).test(key)
            }
        }
        const property = this.resolvePath(variable, data)
        let result = false
        if (value) {
            switch (operator) {
                case '=':
                    result = property == value
                    break
                case '!=':
                    result = property !== value
                    break
                case '>=':
                    result = property >= value
                    break
                case '>':
                    result = property > value
                    break
                case '<=':
                    result = property <= value
                    break
                case '<':
                    result = property < value
                    break
                case '=~':
                    result = new RegExp(value).test(property)
                    break
            }
        }
        return condition.negation ? !result : result
    }

    private evaluateWildcard(data: Object, condition?: PredicateExpression): Object {
        const result: Object[] = []
        this.currentKeys = []
        for (const [key, value] of Object.entries(data)) {
            if (!condition || this.evaluatePredicate(key, value, condition)) {
                result.push(value)
                this.currentKeys.push(key)
            }
        }
        return result.length > 1 ? result : result[0]
    }

    private evaluateStep(data: Object, path: string): Object {
        if (Array.isArray(data)) {
            let result = []
            if (path == 'name') {
                result = this.currentKeys
            } else {
                for (const node of data) {
                    this.currentKeys = []
                    if (Object.getOwnPropertyDescriptor(node, path)) {
                        result.push(node[path])
                        this.currentKeys.push(path)
                    }
                }
            }
            return result.length > 1 ? result : result[0]
        } else {
            if (path == 'name') {
                return this.currentKeys[0]
            } else if (path == 'relationship') {
                const name = this.resolvePath(path, data)
                this.currentKeys = [name]
                return this.currentTemplate?.topology_template?.relationship_templates?.[name] || {}
            }
            this.currentKeys = [path]
            return this.resolvePath(path, data)
        }
    }

    /**
     * Returns a set of nodes that belong to a group
     * @param data The service template
     * @param name The name of the group
     */

    private evaluateGroup(data: any, name: string): NodeTemplateMap {
        const groupNodesNames = data['topology_template']['groups']?.[name]?.['members']
        if (groupNodesNames == undefined) {
            throw new Error(`Could not find group ${name}`)
        }
        const result: NodeTemplateMap = {}
        this.currentKeys = groupNodesNames
        for (const i of groupNodesNames) {
            result[i] = data['topology_template']['node_templates'][i]
        }
        return result
    }

    /**
     * Returns an array of nodes that are targeted by a policy
     * @param data The service template
     * @param name The name of the policy
     */

    private evaluatePolicy(data: any, name: string): NodeTemplateMap {
        const policyNodeNames = data['topology_template']['policies']?.[0]?.[name]?.['targets']
        if (policyNodeNames == undefined) {
            throw new Error(`Could not find policy ${name}`)
        }
        const result: any = {}
        this.currentKeys = policyNodeNames
        for (const i of policyNodeNames) {
            result[i] = data['topology_template']['node_templates'][i]
        }
        return result
    }

    private static getNodesByName(data: ServiceTemplate, names: string[]): {[name: string]: NodeTemplate} {
        const result: {[name: string]: NodeTemplate} = {}
        for (const node of names) {
            if (data.topology_template?.node_templates?.[node])
                result[node] = data.topology_template?.node_templates?.[node]
        }
        return result
    }

    private resolvePath(path: string, obj: any, index?: number): any {
        if (path == 'name' && index != undefined) return this.currentKeys[index]
        return path.split('.').reduce(function (prev, curr) {
            return prev ? prev[curr] : null
        }, obj)
    }
}
