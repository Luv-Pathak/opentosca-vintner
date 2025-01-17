import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import * as utils from '#utils'
import * as path from 'path'

async function run(name: string, id: string, variant: string) {
    const dir = path.join('docs', 'docs', 'sofdcar')
    const template = files.loadYAML<ServiceTemplate>(path.join(dir, name + '.yaml'))
    await files.renderFile(
        path.join(__dirname, 'profile.template.ejs'),
        {
            template,
            utils: {
                toYAML: files.toYAML,
                toTitle: (value: string) =>
                    value
                        .split('_')
                        .map(it => utils.toFirstUpperCase(it))
                        .join(' '),
                toText: (value: string) => value.split('_').join(' '),
                toFigure: (value: string) => name + '.' + value.replace('_', '-') + '.svg',
            },
            profile: {
                id,
                variant,
            },
        },
        path.join(dir, name + '.md')
    )
}

async function main() {
    await run('tosca-sofdcar-profile-core', 'c', 'Core')
    await run('tosca-sofdcar-profile-extended', 'e', 'Extended')
}

main()
