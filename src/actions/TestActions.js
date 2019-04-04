const {getModel} = require('../connections/database')
const Git = require('../sandbox/Git')
const Compiler = require('../sandbox/Compiler')

const _getOneIssue = async () => {
    const Issue = getModel('Issue')

    return await Issue.findOne({status: 'processing'}).sort({created: -1}).lean()
}

const _delay = async (time = 60000) => {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}

const _getInputContest = async (contestId) => {
    const Contest = getModel('Contest')
    const contest = await Contest.findOne({_id: contestId}).lean()

    if (!contest) return {}
    const {input} = contest

    return Object.assign({}, input)
}

const _processOne = async (issue) => {
    const {_id, source, contest} = issue
    const Issue = getModel('Issue')
    const input = await _getInputContest(contest)

    try {
        const dir = await Git.clone(source)

        try {
            const output = await Compiler.compiler(dir, input)
            const trimmed = output ? (output + '').trim() : ''
            console.log(`Repo: ${source}. Output:`, output)

            await Issue.updateOne(
                {_id},
                {
                    $set: {
                        output: trimmed,
                        status: 'compiled',
                        updated: Date.now(),
                        message: '',
                    }
                }
            )
        } catch (e) {
            await Git.clear(dir)

            throw e
        }

        await Git.clear(dir)

        return true
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
        console.log('No processing issue. Waiting...')
        await _delay(10000)

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
