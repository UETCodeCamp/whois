const {getModel} = require('../connections/database')
const Git = require('../sandbox/Git')
const Compiler = require('../sandbox/Compiler')
const TaskActions = require('../actions/TaskActions')

const _getOneIssue = async () => {
    const Issue = getModel('Issue')

    return await Issue.findOne({status: 'processing'}).sort({created: -1}).lean()
}

const _delay = async (time = 60000) => {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}

const _getContestRequirement = async (contestId) => {
    const Contest = getModel('Contest')
    const contest = await Contest.findOne({_id: contestId}).lean()

    if (!contest) return {input: {}, output: ''}
    const {input, output} = contest

    const inp = Object.assign({}, input)

    return {
        input: inp,
        output: output || '',
    }
}

const _is_pass = (result = {}, expectation = {}) => {
    const {text, texts} = Object.assign({}, result)
    const {text: text2, texts: texts2} = Object.assign({}, expectation)

    if (text2) {
        return text === text2
    }

    const arr1 = Array.isArray(texts) ? texts : []
    const arr2 = Array.isArray(texts2) ? texts2 : []

    if (!arr1.length || !arr2.length || arr1.length !== arr2.length) return false

    let is_pass= true
    arr1.forEach((text1, index1) => {
        if (text1 !== arr2[index1]) {
            is_pass = false
        }
    })

    return is_pass
}

const _processOne = async (issue) => {
    const {_id, source, contest, camper} = issue
    const Issue = getModel('Issue')
    const {input, output: expectedOutput} = await _getContestRequirement(contest)

    try {
        const dir = await Git.clone(source)

        try {
            const output = await Compiler.compiler(dir, input)
            console.log(`Repo: ${source}. Output:`, JSON.stringify(output))

            await Issue.updateOne(
                {_id},
                {
                    $set: {
                        output: Object.assign({}, output),
                        status: 'compiled',
                        updated: Date.now(),
                        message: '',
                    }
                }
            )

            const is_pass = _is_pass(output, expectedOutput)
            console.log({is_pass})
            const {_id: taskId} = await TaskActions.getTask({contest, camper, is_pass})
            await TaskActions.updateTask(taskId, {is_pass, updated: Date.now()})
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
