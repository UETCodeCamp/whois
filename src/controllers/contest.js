const ContestActions = require('../api-actions/ContestActions')
const ContestCreatorActions = require('../api-actions/ContestCreatorActions')
const {sendError, sendSuccess} = require('../helpers/response')

exports.createContest = (req, res) => {
    const args = Object.assign({}, req.body)
    const headers = Object.assign({}, req.headers)
    const password = headers['x-password'] || ''

    if (password !== 'i_am_mentor') {
        return res.send({
            success: false,
            message: 'Password is incorrect.'
        })
    }

    ContestCreatorActions.create(args)
        .then(sendSuccess(req, res))
        .catch(sendError(req, res))
}

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
