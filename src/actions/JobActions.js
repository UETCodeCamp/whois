const {getModel} = require('../connections/database')
const RunnerServices = require('../services/RunnerServices')

exports.isFree = async () => {
    return true
}

exports.runNextJob = async () => {
    const Job = getModel('Job')

    const nextJob = await Job
        .findOne({
            status: 'pending'
        })
        .sort({created: -1})
        .lean()

    if (!nextJob) {
        console.log('There is no job to process.')

        return true
    }

    const {tester_repo, student_repo, _id: jobId} = nextJob
    const textId = jobId.toString ? jobId.toString() : jobId

    try {
        const result = await RunnerServices.request({
            id: textId,
            token: textId,
            tester_repo,
            student_repo,
        })

        if (result) {
            await Job.updateOne(
                {
                    _id: jobId,
                },
                {
                    $set: {
                        status: "processing",
                        updated: Date.now(),
                    }
                }
            )
        }
    } catch (e) {
        console.log('Request job error:', e)
    }

    return true
}
