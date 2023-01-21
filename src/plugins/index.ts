import {FilePlugin} from '#plugins/file'
import {VintnerPlugin} from '#plugins/vintner'
import {WineryPlugin} from '#plugins/winery'
import path from 'path'
import config from '#config'
import * as files from '#files'
import {OrchestratorsConfig} from './types'
import * as validator from '#validator'
import {OperaPlugin} from '#plugins/opera'
import {UnfurlPlugin} from '#plugins/unfurl'

const configPath = path.join(config.home, 'plugins.yaml')

function getConfig() {
    return files.loadYAML<OrchestratorsConfig>(configPath)
}

function setConfig(config: OrchestratorsConfig) {
    files.storeYAML(configPath, config)
}

function getOrchestrator() {
    const config = getConfig()

    switch (config.enabled) {
        case 'opera':
            validator.ensureDefined(config.opera, 'Opera is enabled but no config was found')
            return new OperaPlugin({...config.opera, wsl: false})

        case 'opera-wsl':
            validator.ensureDefined(config.operaWSL, 'OperaWSL is enabled but no config was found')
            return new OperaPlugin({...config.operaWSL, wsl: true})

        case 'unfurl':
            validator.ensureDefined(config.unfurl, 'Unfurl is enabled but no config was found')
            return new UnfurlPlugin({...config.unfurl, wsl: false})

        case 'unfurl-wsl':
            validator.ensureDefined(config.unfurlWSL, 'UnfurlWSL is enabled but no config was found')
            return new UnfurlPlugin({...config.unfurlWSL, wsl: true})

        case undefined:
            throw new Error('No orchestrator is enabled')

        default:
            throw new Error(`Orchestrator "${config.enabled}" is not supported`)
    }
}

function getTemplateRepository(name: string) {
    switch (name) {
        case 'file':
            return new FilePlugin()

        case 'vintner':
            return new VintnerPlugin()

        case 'winery':
            return new WineryPlugin()

        default:
            throw new Error(`Unknown templates plugin "${name}"`)
    }
}

export default {
    getConfig,
    setConfig,
    getOrchestrator,
    getTemplateRepository,
}