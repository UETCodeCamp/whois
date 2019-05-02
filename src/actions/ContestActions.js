const {getModel} = require('../connections/database')
const Promise = require('bluebird')
const IssueActions = require('./IssueActions')

const _syncIssues = async (contest) => {
    const {owner, repo} = contest
    console.log(`Syncing all issues of repo: ${owner}/${repo}...`)
    await IssueActions.fetchAllIssues(contest)

    return true
}

exports.syncActiveContests = async () => {
    const Contest = getModel('Contest')

    const contests = await Contest.find({
        // status: 'active',
        deadline: {
            $gt: Date.now()
        }
    })

    if (!contests || !contests.length) {
        console.log('No active contest to sync.')
    }

    await Promise.map(contests, async contest => {
        await _syncIssues(contest)

        return true
    }, {concurrency: 1})

    return true
}

exports.getContest = async ({owner, repo, input = {}, output = {}}) => {
    const Contest = getModel('Contest')
    const exist = await Contest.findOne({owner, repo}).lean()

    const i = Object.assign({}, input)
    const o = Object.assign({}, output)

    if (exist) {
        await Contest.updateOne({_id: exist._id}, {
            $set: {input: i, output: o, updated: Date.now()}
        })

        return Contest.findOne({_id: exist._id}).lean()
    }

    const newContest = new Contest({
        owner,
        repo,
        input: i,
        output: o
    })

    const doc = await newContest.save()

    return doc.toJSON()
}

