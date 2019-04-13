const scheduler = require('node-schedule')
const {EVERY_MINUTE} = require('./constants/Crontab')
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
        await _delay(5000)

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

    scheduler.scheduleJob(EVERY_MINUTE, async () => {
        await issue.parseAllIssues()
        await issue.addIssuesToQueue()
    })

    await _syncContests()
}

const EventServices = require('./services/EventServices')
const _subscribe = async () => {
    EventServices.on('ISSUE_CREATED', issue.handleAfterCreatingIssue)
    EventServices.on('ISSUE_URL_PARSED', issue.handleAfterParsingIssue)
    EventServices.on('JOB_CREATED', job.handleAfterCreatingNewJob)
    EventServices.on('JOB_PROCESSING', job.handleAfterCreatingNewJob)
}

const _run = async () => {
    console.log('Workers is running...')

    await _subscribe()
    await _register()
}

exports.run = () => {
    setTimeout(async () => {
        await _run()
    }, 0)
}