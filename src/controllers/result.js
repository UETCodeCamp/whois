const ResultActions = require('../actions/ResultActions')
const {sendError, sendSuccess} = require('../helpers/response')

exports.submit = (req, res) => {
    const {id, result} = Object.assign({}, req.body)
    const {'x-token': token} = Object.assign({}, req.headers)

    ResultActions.submitResult({id, result, token})
        .then(sendSuccess(req, res))
        .catch(sendError(req, res))
}

