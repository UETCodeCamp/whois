const {getModel} = require('../connections/database')
const TaskActions = require('./TaskActions')
const EventServices = require('../services/EventServices')

exports.completeIssueWithJob = async (job) => {
    const {is_pass, message, issue: issueId} = Object.assign({}, job)

    const Issue = getModel('Issue')
    const issue = await Issue.findOne({_id: issueId}).lean()
    if (!issue) {
        throw new Error('Issue not found.')
    }

    await Issue.updateOne(
        {_id: issueId},
        {
            $set: {
                is_pass: !!is_pass,
                message,
                status: 'processed',
                updated: Date.now(),
            }
        }
    )

    const updatedIssue = await Issue.findOne({_id: issueId}).lean()
    await TaskActions.updateTaskByIssue(updatedIssue)

    EventServices.emit('ISSUE_COMPLETED', updatedIssue)

    return true
}
