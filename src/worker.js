const owner = 'tutv'
const repo = 'tets-whois'

const _run = async () => {
    const issue = require('./workers/issue')

    await issue.fetchIssues({owner, repo})
}

setTimeout(async () => {
    await _run()
}, 0)