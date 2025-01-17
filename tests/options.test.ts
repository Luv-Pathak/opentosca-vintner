import Graph from '#graph/graph'
import {TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {expect} from 'chai'

describe('options', () => {
    it('mode: strict', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'strict'}, inputs: {}}},
        })

        expect(graph.options.default).to.deep.equal({
            mode: 'strict',
            default_condition: false,
            node_default_condition: false,
            relation_default_condition: false,
            policy_default_condition: false,
            group_default_condition: false,
            artifact_default_condition: false,
            property_default_condition: false,
            type_default_condition: false,
        })

        expect(graph.options.pruning).to.deep.equal({
            mode: 'strict',
            pruning: false,
            node_pruning: false,
            relation_pruning: false,
            policy_pruning: false,
            group_pruning: false,
            artifact_pruning: false,
            property_pruning: false,
            type_pruning: false,
        })
    })

    it('mode: loose', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'loose'}, inputs: {}}},
        })

        expect(graph.options.default).to.deep.equal({
            mode: 'loose',
            default_condition: true,
            node_default_condition: true,
            relation_default_condition: true,
            policy_default_condition: true,
            group_default_condition: true,
            artifact_default_condition: true,
            property_default_condition: true,
            type_default_condition: true,
        })

        expect(graph.options.pruning).to.deep.equal({
            mode: 'loose',
            pruning: true,
            node_pruning: true,
            relation_pruning: true,
            policy_pruning: true,
            group_pruning: true,
            artifact_pruning: true,
            property_pruning: true,
            type_pruning: true,
        })
    })

    it('default_condition: false', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {default_condition: false}, inputs: {}}},
        })

        expect(graph.options.default).to.deep.equal({
            default_condition: false,
            node_default_condition: false,
            relation_default_condition: false,
            policy_default_condition: false,
            group_default_condition: false,
            artifact_default_condition: false,
            property_default_condition: false,
            type_default_condition: false,
        })
    })

    it('default_condition: true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {default_condition: true}, inputs: {}}},
        })

        expect(graph.options.default).to.deep.equal({
            default_condition: true,
            node_default_condition: true,
            relation_default_condition: true,
            policy_default_condition: true,
            group_default_condition: true,
            artifact_default_condition: true,
            property_default_condition: true,
            type_default_condition: true,
        })
    })

    it('pruning: true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {pruning: true}, inputs: {}}},
        })

        expect(graph.options.pruning).to.deep.equal({
            pruning: true,
            node_pruning: true,
            relation_pruning: true,
            policy_pruning: true,
            group_pruning: true,
            artifact_pruning: true,
            property_pruning: true,
            type_pruning: true,
        })
    })

    it('pruning: false', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {pruning: false}, inputs: {}}},
        })

        expect(graph.options.pruning).to.deep.equal({
            pruning: false,
            node_pruning: false,
            relation_pruning: false,
            policy_pruning: false,
            group_pruning: false,
            artifact_pruning: false,
            property_pruning: false,
            type_pruning: false,
        })
    })

    it('strict override: default_condition true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'strict', default_condition: true}, inputs: {}}},
        })

        expect(graph.options.default).to.deep.equal({
            mode: 'strict',
            default_condition: true,
            node_default_condition: true,
            relation_default_condition: true,
            policy_default_condition: true,
            group_default_condition: true,
            artifact_default_condition: true,
            property_default_condition: true,
            type_default_condition: true,
        })
    })

    it('strict override: default_condition false', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'loose', default_condition: false}, inputs: {}}},
        })

        expect(graph.options.default).to.deep.equal({
            mode: 'loose',
            default_condition: false,
            node_default_condition: false,
            relation_default_condition: false,
            policy_default_condition: false,
            group_default_condition: false,
            artifact_default_condition: false,
            property_default_condition: false,
            type_default_condition: false,
        })
    })

    it('strict override: pruning true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'strict', pruning: true}, inputs: {}}},
        })

        expect(graph.options.pruning).to.deep.equal({
            mode: 'strict',
            pruning: true,
            node_pruning: true,
            relation_pruning: true,
            policy_pruning: true,
            group_pruning: true,
            artifact_pruning: true,
            property_pruning: true,
            type_pruning: true,
        })
    })

    it('strict override: pruning false', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'loose', pruning: false}, inputs: {}}},
        })

        expect(graph.options.pruning).to.deep.equal({
            mode: 'loose',
            pruning: false,
            node_pruning: false,
            relation_pruning: false,
            policy_pruning: false,
            group_pruning: false,
            artifact_pruning: false,
            property_pruning: false,
            type_pruning: false,
        })
    })

    it('default_condition override: node_default_condition false', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {
                variability: {options: {default_condition: true, node_default_condition: false}, inputs: {}},
            },
        })

        expect(graph.options.default).to.deep.equal({
            default_condition: true,
            node_default_condition: false,
            relation_default_condition: true,
            policy_default_condition: true,
            group_default_condition: true,
            artifact_default_condition: true,
            property_default_condition: true,
            type_default_condition: true,
        })
    })

    it('default_condition override: node_default_condition true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {
                variability: {options: {default_condition: false, node_default_condition: true}, inputs: {}},
            },
        })

        expect(graph.options.default).to.deep.equal({
            default_condition: false,
            node_default_condition: true,
            relation_default_condition: false,
            policy_default_condition: false,
            group_default_condition: false,
            artifact_default_condition: false,
            property_default_condition: false,
            type_default_condition: false,
        })
    })
})
