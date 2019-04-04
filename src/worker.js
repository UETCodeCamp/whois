const Schedule = require('node-schedule')
const {EVERY_MINUTE} = require('./constants/Crontab')

const _getCurrentContest = () => {
    const repo = process.env.GITHUB_REPO || 'tets-whois'
    const owner = process.env.GITHUB_OWNER || 'tutv'

    return {
        repo,
        owner
    }
}

const _register = async () => {
    console.log('Register cron jobs.')

    Schedule.scheduleJob(EVERY_MINUTE, async () => {
        const {owner, repo} = _getCurrentContest()
        const issue = require('./workers/issue')
        await issue.fetchIssues({owner, repo})
    })
}

const _run = async () => {
    await _register()
    const {owner, repo} = _getCurrentContest()

    console.log('Owner', owner)
    console.log('Repo', repo)

    const issue = require('./workers/issue')
    await issue.fetchIssues({owner, repo})

    issue.processIssueOneByOne()
    issue.testIssueOneByOne()
}

setTimeout(async () => {
    await _run()
}, 0)
