const {getModel} = require('../connections/database')
const GitHubServices = require('../services/GitHubServices')
const LinkParser = require('../services/LinkParser')
const CamperActions = require('./CamperActions')
const IssueProcessActions = require('./IssueProcessActions')
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

exports.parseIssues = async () => {
    const Issue = getModel('Issue')

    const issues = await Issue.find({
        is_parsed: {
            $ne: true
        }
    }).lean()

    console.log('Parsing issues:', issues.length)

    await Promise.map(issues, async issue => {
        await IssueProcessActions.parseIssue(issue)

        return true
    }, {concurrency: 1})

    return true
}

const _addToQueue = async (issue) => {
    const Job = getModel('Job')
    const {_id: issueId, contest, source} = issue
    const {owner, repo} = Object.assign({}, contest)

    if (!owner || !repo) return false


    const exist = await Job.findOne({issue: issueId}).lean()
    if (exist) return true

    const tester_repo = LinkParser.getFulLink({owner, repo})

    const newJob = new Job({
        issue: issueId,
        student_repo: source,
        tester_repo,
        status: 'pending',
    })

    await newJob.save()

    return true
}

exports.addIssuesToQueue = async () => {
    const Issue = getModel('Issue')
    const Contest = getModel('Contest')

    const issues = await Issue
        .find({status: 'pending', is_parsed: true})
        .populate({
            path: 'contest',
            model: Contest,
        })
        .sort({created: 1})
        .lean()

    console.log('Add issues to queue:', issues.length)

    await Promise.map(issues, async issue => {
        await _addToQueue(issue)

        return true
    }, {concurrency: 1})

    return true
}
