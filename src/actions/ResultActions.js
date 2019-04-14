const {getModel} = require('../connections/database')
const CompleteIssueActions = require('./CompleteIssueActions')
const RunnerServices = require('../services/RunnerServices')

const _validateArgs = (args = {}) => {
    const {id, result, secret} = Object.assign({}, args)
    const {is_pass, message, std_out, std_err} = Object.assign({}, result)

    return {
        id,
        is_pass: !!is_pass,
        message: message || '',
        std_out: std_out || '',
        std_err: std_err || '',
        secret: secret || '',
    }
}

exports.submitResult = async (args = {}) => {
    const {id, is_pass, message, std_out, std_err, secret} = _validateArgs(args)

    if (!RunnerServices.isValid(secret)) {
        console.error('Invalid secret key.')

        throw new Error('Invalid secret key.')
    }

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

    const updatedJob = await Job.findOne({_id: job._id}).lean()
    await CompleteIssueActions.completeIssueWithJob(updatedJob)

    return true
}
