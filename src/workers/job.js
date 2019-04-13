const JobActions = require('../actions/JobActions')

exports.processJob = async () => {
    try {
        const isFree = await JobActions.isFree()
    } catch (e) {
        console.log(e)
    }
}
