import {human2cron, SensorBaseOptions, submit} from '#controller/sensors/utils'
import {InputAssignmentMap} from '#spec/topology-template'
import day from '#utils/day'
import death from '#utils/death'
import hae from '#utils/hae'
import * as validator from '#validator'
import console from 'console'
import cron from 'node-cron'

export type SensorWeekdayOptions = SensorBaseOptions & {start?: string}

const week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export default async function (options: SensorWeekdayOptions) {
    let index = day().day()
    if (validator.isDefined(options.start)) {
        index = week.findIndex(d => d === options.start)
        if (index === -1) throw new Error(`Did not find day "${options.start}"`)
    }

    async function handle() {
        const inputs: InputAssignmentMap = {weekday: week[index]}
        console.log(inputs)

        if (options.disableSubmission) return
        await submit(options, inputs)
    }

    await handle()
    const task = cron.schedule(
        human2cron(options.timeInterval),
        hae.log(async () => {
            await handle()
            index = (index + 1) % 7
        })
    )
    death.register(task)
}
