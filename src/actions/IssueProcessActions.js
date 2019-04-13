const {getModel} = require('../connections/database')
const LinkParser = require('../services/LinkParser')
const EventServices = require('../services/EventServices')

const _parseOne = async (issue) => {
    const {_id, body} = issue
    const Issue = getModel('Issue')

    let success = false

    try {
        const link = LinkParser.parseLinkGithub(body)

        await Issue.updateOne(
            {_id},
            {
                $set: {
                    source: link,
                    is_parsed: true,
                    updated: Date.now(),
                }
            }
        )

        success = true
    } catch (error) {
        success = false
        const {message} = error

        await Issue.updateOne(
            {
                _id
            },
            {
                $set: {
                    is_parsed: true,
                    message,
                    updated: Date.now(),
                }
            }
        )
    }

    EventServices.emit('ISSUE_URL_PARSED', {success, issue})

    return true
}

exports.parseIssue = async (issue) => {
    console.log(`Parsing issue "${issue.title}"...`,)

    try {
        await _parseOne(issue)
    } catch (e) {
        console.error('Processing issue has error:', e)

        return false
    }

    return true
}

const _markProcessing = async (issueId) => {
    const Issue = getModel('Issue')
    const issue = await Issue.findOne({_id: issueId}).lean()

    if (!issue) {
        throw new Error('Issue not found.')
    }

    await Issue.updateOne(
        {_id: issueId},
        {
            $set: {
                status: 'processing',
                updated: Date.now(),
            }
        }
    )

    return true
}

exports.markProcessing = _markProcessing

exports.handleJobProcessing = async job => {
    const {issue} = Object.assign({}, job)

    if (issue) await _markProcessing(issue)

    return true
}
