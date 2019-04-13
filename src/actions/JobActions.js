const {getModel} = require('../connections/database')
const RunnerServices = require('../services/RunnerServices')
const moment = require('moment')

exports.isFree = async () => {
    const Job = getModel('Job')
    const oneHourAgo = moment().subtract(5, 'minutes')

    const processingJob = await Job.findOne({
        status: 'processing',
        updated: {
            $gt: oneHourAgo.valueOf()
        }
    }).lean()

    if (processingJob) {
        console.log('System is processing a job with id:', processingJob._id)

        return false
    }

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

    console.log('Request running job:', textId)
    console.log('Student repo:', student_repo)
    console.log('Tester repo:', tester_repo)

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
        console.error('Request job error:', e.message)
    }

    return true
}

