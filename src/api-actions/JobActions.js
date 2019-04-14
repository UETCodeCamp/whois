const {getModel} = require('../connections/database')

exports.getListJobs = async () => {
    const Jobs = getModel('Job')

    const jobs = await Jobs
        .find({})
        .populate({
            path: 'issue',
            model: 'Issue',
        })
        .sort({
            submitted: -1,
        })
        .limit(100)
        .lean()

    return {
        jobs
    }
}

