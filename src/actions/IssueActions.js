const {getModel} = require('../connections/database')
const GitHubServices = require('../services/GitHubServices')
const ContestActions = require('../actions/ContestActions')
const CamperActions = require('../actions/CamperActions')
const Promise = require('bluebird')

const _saveIssue = ({owner, repo}) => async (contestId, issue) => {
    const {id, title, body, user} = issue
    const {id: github_id, login} = user

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
    })

    const doc = await newIssue.save()

    return doc.toJSON()
}

exports.fetchAllIssues = async ({owner = '', repo = ''}) => {
    const issues = await GitHubServices.issues({owner, repo})

    const {_id: contestId} = await ContestActions.getContest({owner, repo})

    await Promise.map(issues, async issue => {
        return _saveIssue({owner, repo})(contestId, issue)
    }, {concurrency: 1})
}
