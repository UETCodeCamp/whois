const ContestActions = require('../api-actions/ContestActions')
const ContestCreatorActions = require('../api-actions/ContestCreatorActions')
const {sendError, sendSuccess} = require('../helpers/response')

exports.submit = (req, res) => {
    const {id, result} = Object.assign({}, req.body)
    const {'x-token': token} = Object.assign({}, req.headers)


}

