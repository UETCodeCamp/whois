const JobActions = require('../actions/JobActions')

exports.processJob = async () => {
    try {
        const isFree = await JobActions.isFree()

        if (!isFree) {
            return false
        }

        await JobActions.runNextJob()
    } catch (e) {
        console.log(e)
    }
}
