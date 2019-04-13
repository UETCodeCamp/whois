const ContestActions = require('../actions/ContestActions')

exports.syncAllContests = async () => {
    await ContestActions.syncActiveContests()
}

