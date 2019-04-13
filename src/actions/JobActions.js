const {getModel} = require('../connections/database')
const RunnerServices = require('../services/RunnerServices')
const IssueProcessActions = require('./IssueProcessActions')
const EventServices = require('../services/EventServices')
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

    const jobs = await Job
        .find({
            status: 'pending'
        })
        .limit(1)
        .sort({created: 1})
        .lean()

    if (!jobs || !jobs.length) {
        console.log('There is no job to process.')

        return true
    }

    const nextJob = jobs[0]
    const {tester_repo, student_repo, _id: jobId, issue} = nextJob
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

            EventServices.emit('JOB_PROCESSING', nextJob)

            await IssueProcessActions.markProcessing(issue)
        }
    } catch (e) {
        console.error('Request job error:', e.message)
    }

    return true
}

