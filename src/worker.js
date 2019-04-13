const scheduler = require('node-schedule')
const {EVERY_FIVE_MINUTES, EVERY_MINUTE} = require('./constants/Crontab')
const contest = require('./workers/contest')
const issue = require('./workers/issue')
const job = require('./workers/job')

const _delay = async (time = 1000) => {
    console.log(`Delay ${time} ms...`)

    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}

const _syncContests = async () => {
    console.log('Start syncing contests.')

    try {
        await contest.syncAllContests()
        await _delay(30000)

        return _syncContests()
    } catch (error) {
        await _delay(5 * 60 * 1000)

        return _syncContests()
    }
}

const _register = async () => {
    scheduler.scheduleJob(EVERY_MINUTE, async () => {
        await job.processJob()
    })

    scheduler.scheduleJob(EVERY_FIVE_MINUTES, async () => {
        await issue.parseAllIssues()
        await issue.addIssuesToQueue()
    })

    await _syncContests()
}

const _run = async () => {
    console.log('Workers is running...')

    await _register()
}


setTimeout(async () => {
    await _run()
}, 0)
