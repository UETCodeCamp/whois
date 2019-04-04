const ContestActions = require('../api-actions/ContestActions')
const {sendError, sendSuccess} = require('../helpers/response')

exports.getListContests = (req, res) => {
    const args = Object.assign({}, req.query)

    ContestActions.getListContests(args)
        .then(sendSuccess(req, res))
        .catch(sendError(req, res))
}

exports.getContestDetail = (req, res) => {
    const {id} = req.params

    ContestActions.getContestDetail(id)
        .then(sendSuccess(req, res))
        .catch(sendError(req, res))
}

exports.getListTasks = (req, res) => {
    const {id} = req.params

    ContestActions.getListTasks(id)
        .then(sendSuccess(req, res))
        .catch(sendError(req, res))
}

exports.getListIssues = (req, res) => {
    const {id} = req.params

    ContestActions.getListIssues(id)
        .then(sendSuccess(req, res))
        .catch(sendError(req, res))
}
