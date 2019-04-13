const JobActions = require('../actions/JobActions')
const CompleteIssueActions = require('../actions/CompleteIssueActions')

exports.processJob = async () => {
    try {
        const isFree = await JobActions.isFree()
        if (!isFree) return false

        await JobActions.runNextJob()
    } catch (e) {
        console.log(e)
    }
}

exports.handleAfterCreatingNewJob = async (job) => {
    console.log('Created a job with id:', job._id)
}

exports.handleAfterJobSubmitted = async (job) => {
    await CompleteIssueActions.completeIssueWithJob(job)

    return true
}
