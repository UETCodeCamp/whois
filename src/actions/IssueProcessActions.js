const {getModel} = require('../connections/database')
const LinkParser = require('../services/LinkParser')

const _getOneIssue = async () => {
    const Issue = getModel('Issue')

    return await Issue.findOne({status: 'pending'}).sort({created: -1}).lean()
}

const _delay = async (time = 60000) => {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}

const _processOne = async (issue) => {
    const {_id, body} = issue
    const Issue = getModel('Issue')

    try {
        const link = LinkParser.parseLinkGithub(body)

        await Issue.updateOne(
            {_id},
            {
                $set: {
                    source: link,
                    status: 'processing',
                    updated: Date.now(),
                }
            }
        )
    } catch (error) {
        const {message} = error

        await Issue.updateOne(
            {
                _id
            },
            {
                $set: {
                    status: 'processed',
                    message,
                    updated: Date.now(),
                }
            }
        )
    }
}

const _process = async () => {
    const issue = await _getOneIssue()

    if (!issue) {
        console.log('No issue. Waiting...')
        await _delay(60000)

        return _process()
    }

    await _processOne(issue)
    await _delay(1000)

    return _process()
}

exports.process = async () => {
    try {
        await _process()
    } catch (e) {
        console.error('Processing issue has error:', e)
    }
}
