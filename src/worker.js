const Schedule = require('node-schedule')
const {EVERY_MINUTE} = require('./constants/Crontab')

const _register = async () => {
    console.log('Register cron jobs.')

    Schedule.scheduleJob(EVERY_MINUTE, async () => {
        const owner = 'tutv'
        const repo = 'tets-whois'
        const issue = require('./workers/issue')
        await issue.fetchIssues({owner, repo})
    })
}

const _run = async () => {
    await _register()

    const owner = 'tutv'
    const repo = 'tets-whois'
    const issue = require('./workers/issue')
    await issue.fetchIssues({owner, repo})

    issue.processIssueOneByOne()
    issue.testIssueOneByOne()
}

setTimeout(async () => {
    await _run()
}, 0)