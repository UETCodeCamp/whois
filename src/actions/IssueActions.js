const {getModel} = require('../connections/database')
const GitHubServices = require('../services/GitHubServices')
const LinkParser = require('../services/LinkParser')
const CamperActions = require('./CamperActions')
const IssueProcessActions = require('./IssueProcessActions')
const Promise = require('bluebird')
const moment = require('moment')
const EventServices = require('../services/EventServices')
const delay = require('../helpers/delay')

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
    const object = doc.toJSON()

    EventServices.emit('ISSUE_CREATED', object)
    await delay(1000)

    return object
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
    const {_id: issueId, contest, source, created} = issue
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
        submitted: created
    })

    const doc = await newJob.save()

    const Issue = getModel('Issue')
    await Issue.updateOne(
        {_id: issueId},
        {
            $set: {
                is_queued: true,
                updated: Date.now(),
            }
        }
    )

    const object = doc.toJSON()
    EventServices.emit('JOB_CREATED', object)

    return true
}

exports.addIssueToQueue = async (issue) => {
    const Issue = getModel('Issue')
    const Contest = getModel('Contest')

    const doc = await Issue.findOne({_id: issue._id})
        .populate({
            path: 'contest',
            model: Contest,
        })
        .lean()

    if (!doc) {
        throw new Error('Issue not found.')
    }

    return _addToQueue(doc)
}

exports.addIssuesToQueue = async () => {
    const Issue = getModel('Issue')
    const Contest = getModel('Contest')

    const issues = await Issue
        .find({
            status: 'pending',
            is_parsed: true,
            is_queued: {
                $ne: true
            }
        })
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
