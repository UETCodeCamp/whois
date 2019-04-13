const IssueActions = require('../actions/IssueActions')

exports.parseAllIssues = async () => {
    await IssueActions.parseIssues()

    return true
}

exports.addIssuesToQueue = async () => {
    await IssueActions.addIssuesToQueue()

    return true

}
