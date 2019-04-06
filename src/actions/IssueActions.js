const {getModel} = require('../connections/database')
const GitHubServices = require('../services/GitHubServices')
const ContestActions = require('../actions/ContestActions')
const CamperActions = require('../actions/CamperActions')
const Promise = require('bluebird')
const request = require('request-promise-native')

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

const _getRequirement = async ({owner, repo}) => {
    if (!owner || !repo) {
        return {
            input: {},
            output: {}
        }
    }

    const _getLinkRawFile = name => {
        return `https://raw.githubusercontent.com/${owner}/${repo}/master/${name}?r=${Date.now()}`
    }

    const inputFile = _getLinkRawFile('input.json')
    const outputFile = _getLinkRawFile('output.json')

    const _getFileJSON = async (url) => {
        try {
            const content = await request(`${url}?r=${Date.now()}`)
            if (!content) {
                return {}
            }

            return JSON.parse(content)
        } catch (e) {
            return {}
        }
    }

    const [inputJSON, outputJSON] = await Promise.all([
        _getFileJSON(inputFile),
        _getFileJSON(outputFile),
    ])

    return {
        input: Object.assign({}, inputJSON),
        output: Object.assign({}, outputJSON),
    }
}

exports.fetchAllIssues = async ({owner = '', repo = ''}) => {
    const issues = await GitHubServices.issues({owner, repo})

    const {input, output} = await _getRequirement({owner, repo})
    const {_id: contestId} = await ContestActions.getContest({owner, repo, input, output})

    await Promise.map(issues, async issue => {
        return _saveIssue({owner, repo})(contestId, issue)
    }, {concurrency: 1})
}
