const Schedule = require('node-schedule')
const {EVERY_MINUTE} = require('./constants/Crontab')

exports.register = async () => {
    console.log('Register cron jobs.')

    Schedule.scheduleJob(EVERY_MINUTE, async () => {
        await _run()
    })
}

const _run = async () => {
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