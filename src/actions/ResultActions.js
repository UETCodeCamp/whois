const {getModel} = require('../connections/database')
const CompleteIssueActions = require('./CompleteIssueActions')

const _validateArgs = (args = {}) => {
    const {id, result} = Object.assign({}, args)
    const {is_pass, message, std_out, std_err} = Object.assign({}, result)

    return {
        id,
        is_pass: !!is_pass,
        message: message || '',
        std_out: std_out || '',
        std_err: std_err || '',
    }
}

exports.submitResult = async (args = {}) => {
    const {id, is_pass, message, std_out, std_err} = _validateArgs(args)

    if (!id) {
        console.log('Job id is empty.')

        return false
    }

    const Job = getModel('Job')
    const job = await Job.findOne({_id: id}).lean()

    if (!job) {
        throw new Error('Job not found.')
    }

    await Job.updateOne(
        {
            _id: job._id,
        },
        {
            $set: {
                is_pass,
                message,
                std_err,
                std_out,
                status: 'processed',
                updated: Date.now(),
            }
        }
    )

    const {issue} = job
    await CompleteIssueActions.completeIssue(issue, {
        is_pass,
        message,
        std_err,
        std_out,
    })

    return true
}
