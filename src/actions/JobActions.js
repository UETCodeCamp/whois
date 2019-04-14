const {getModel} = require('../connections/database')
const RunnerServices = require('../services/RunnerServices')
const IssueProcessActions = require('./IssueProcessActions')
const CompleteIssueActions = require('./CompleteIssueActions')
const EventServices = require('../services/EventServices')
const moment = require('moment')
const Promise = require('bluebird')

const _getMaxRetries = () => {
    const max = process.env.JOB_MAX_RETRIES || 5

    return max > 0 ? parseInt(max, 10) : 5
}

exports.isFree = async () => {
    const Job = getModel('Job')

    const processingJob = await Job.findOne({
        status: 'processing',
    }).lean()

    if (processingJob) {
        console.log('System is processing a job with id:', processingJob._id)

        return false
    }

    return true
}

exports.checkStuckJobs = async () => {
    console.log('Checking stuck jobs...')

    const Job = getModel('Job')

    const timeout = moment().subtract(5, 'minutes').valueOf()
    const stuckJobs = await Job
        .find({
            status: 'processing',
            updated: {
                $lt: timeout
            }
        })
        .sort({
            updated: 1
        })
        .lean()

    console.log('Stuck jobs:', stuckJobs.length)

    if (!stuckJobs || !stuckJobs.length) {
        return false
    }

    await Promise.map(stuckJobs, async job => {
        const {_id, retries} = job
        const currentRetries = retries >= 0 ? parseInt(retries, 10) : 0
        const max = _getMaxRetries()

        if (currentRetries >= max) {
            await Job.updateOne({_id}, {
                $set: {
                    is_pass: false,
                    status: 'processed',
                    message: `Job failed after ${currentRetries} retries.`,
                    updated: Date.now(),
                }
            })

            const updated = await Job.findOne({_id}).lean()
            await CompleteIssueActions.completeIssueWithJob(updated)

            return true
        }

        await Job.updateOne({_id}, {
            $set: {
                retries: currentRetries + 1,
                status: 'pending',
                updated: Date.now(),
            }
        })

        return true
    }, {concurrency: 1})

    return true
}

exports.runNextJob = async () => {
    const Job = getModel('Job')

    const jobs = await Job
        .find({
            status: 'pending'
        })
        .limit(1)
        .sort({submitted: 1})
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

