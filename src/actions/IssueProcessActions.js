const {getModel} = require('../connections/database')
const LinkParser = require('../services/LinkParser')

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
                    is_parsed: true,
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
                    is_parsed: true,
                    message,
                    updated: Date.now(),
                }
            }
        )
    }

    return true
}

exports.parseIssue = async (issue) => {
    console.log(`Parsing issue "${issue.title}"...`,)

    try {
        await _processOne(issue)
    } catch (e) {
        console.error('Processing issue has error:', e)

        return false
    }

    return true
}

exports.markProcessing = async (issueId) => {
    const Issue = getModel('Issue')
    const issue = await Issue.updateOne({_id: issueId}).lean()

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
