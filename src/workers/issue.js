const IssueActions = require('../actions/IssueActions')

exports.fetchIssues = async ({owner, repo}) => {
    await IssueActions.fetchAllIssues({owner, repo})
}

exports.processIssueOneByOne = () => {
    const IssueProcessActions = require('../actions/IssueProcessActions')

    setTimeout(async () => {
        await IssueProcessActions.process()
    }, 0)
}
