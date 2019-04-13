const {getModel} = require('../connections/database')
const GitHubServices = require('../services/GitHubServices')
const CamperActions = require('../actions/CamperActions')
const Promise = require('bluebird')
const moment = require('moment')

const _saveIssue = async (contestId, issue) => {
    const {id, title, body, user, created_at} = issue
    const {id: github_id, login} = user
    const createdMoment = moment(created_at)
    const created = createdMoment.isValid() ? createdMoment.valueOf() : Date.now()

    const {_id: camperId} = await CamperActions.getCamper({username: login, github_id})

    const Issue = getModel('Issue')
    const exist = await Issue.findOne({camper: camperId, contest: contestId, github_id: id}).lean()
    if (exist) return exist

    const newIssue = new Issue({
        camper: camperId,
        contest: contestId,
        github_id: id,
        title,
        body,
        created,
        updated: created,
    })

    const doc = await newIssue.save()

    return doc.toJSON()
}

exports.fetchAllIssues = async (contest) => {
    const {_id: contestId, owner, repo} = contest
    const issues = await GitHubServices.issues({owner, repo})

    console.log(`Total issues of ${owner}/${repo}:`, issues.length)

    await Promise.map(issues, async issue => {
        return _saveIssue(contestId, issue)
    }, {concurrency: 1})

    return true
}
