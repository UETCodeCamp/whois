const IssueActions = require('../actions/IssueActions')
const IssueProcessActions = require('../actions/IssueProcessActions')

exports.handleJobProcessing = async (job) => {
    await IssueProcessActions.handleJobProcessing(job)

    return true
}

exports.handleAfterCreatingIssue = async (issue) => {
    await IssueProcessActions.parseIssue(issue)

    return true
}

exports.handleAfterParsingIssue = async (result) => {
    const {success, issue} = Object.assign({}, result)

    if (success) {
        await IssueActions.addIssueToQueue(issue)
    }

    return true
}

exports.parseAllIssues = async () => {
    await IssueActions.parseIssues()

    return true
}

exports.addIssuesToQueue = async () => {
    await IssueActions.addIssuesToQueue()

    return true
}

