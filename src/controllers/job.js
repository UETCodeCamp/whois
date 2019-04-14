const JobActions = require('../api-actions/JobActions')
const {sendError, sendSuccess} = require('../helpers/response')

exports.getListOfJobs = (req, res) => {

    JobActions.getListJobs()
        .then(sendSuccess(req, res))
        .catch(sendError(req, res))
}

