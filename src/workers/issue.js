const IssueActions = require('../actions/IssueActions')

exports.fetchIssues = async ({owner, repo}) => {
    await IssueActions.fetchAllIssues({owner, repo})
}
