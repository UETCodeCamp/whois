const {getModel} = require('../connections/database')
const moment = require('moment')

const _parseGitHubUrl = url => {
    if (!url) {
        throw new Error('Url must be required.')
    }

    if (url.indexOf('github.com') !== -1) {
        const regex = /github\.com\/(\S+)\/(\S+)/gi
        const parsed = regex.exec(url)

        if (!parsed || parsed.length !== 3) {
            throw new Error('Url is invalid.')
        }

        const owner = parsed[1]
        const repo = parsed[2]

        return {
            owner: owner.trim(),
            repo: repo.trim(),
        }
    }

    if (url.indexOf('/') !== -1) {
        const regex = /(\S+)\/(\S+)/gi
        const parsed = regex.exec(url)

        if (!parsed || parsed.length !== 3) {
            throw new Error('Url is invalid.')
        }

        const owner = parsed[1]
        const repo = parsed[2]

        return {
            owner: owner.trim(),
            repo: repo.trim(),
        }
    }

    throw new Error('Url is invalid.')
}

const _validateDeadline = deadline => {
    if (!deadline) {
        throw new Error('Deadline must be required.')
    }

    const deadlineMoment = moment(deadline)
    if (!deadlineMoment.isValid()) {
        throw new Error('Deadline time is invalid.')
    }

    return deadlineMoment.valueOf()
}

const _validateArgs = (args = {}) => {
    const defaultArgs = {}

    const {url, deadline} = Object.assign({}, defaultArgs, args)
    const {owner, repo} = _parseGitHubUrl(url)
    const vDeadline = _validateDeadline(deadline)

    return {
        owner,
        repo,
        deadline: vDeadline,
    }
}

exports.create = async (args = {}) => {
    const {owner, repo, deadline} = _validateArgs(args)
    const Contest = getModel('Contest')

    const exist = await Contest.findOne({
        owner,
        repo,
    }).lean()

    if (exist) {
        throw new Error('This contest already exists.')
    }

    const newContest = new Contest({
        owner,
        repo,
        deadline
    })

    const doc = await newContest.save()

    return doc.toJSON()
}

