const {getModel} = require('../connections/database')
const LinkParser = require('../services/LinkParser')

const _validateArgs = (args = {}) => {
    const {page, limit} = Object.assign({}, args)

    const vPage = page ? parseInt(page, 10) : 1
    const vLimit = limit ? parseInt(limit, 10) : 10

    return {
        page: vPage,
        limit: vLimit
    }
}

exports.getListContests = async (args = {}) => {
    const Contest = getModel('Contest')

    const {page, limit} = _validateArgs(args)
    const skip = (page - 1) * limit
    const query = {}

    const _findContests = Contest.find(query)
        .select('')
        .skip(skip)
        .limit(limit)
        .sort({
            created: -1
        })
        .lean()

    const _getTotal = Contest.countDocuments(query)

    const [contests, total] = await Promise.all([
        _findContests,
        _getTotal,
    ])

    const pages = Math.ceil(total / limit) || 1


    return {
        contests,
        pages,
        page,
        limit,
        total,
    }
}


exports.getContestDetail = async (contestId) => {
    const Contest = getModel('Contest')

    const contest = await Contest.findOne({_id: contestId}).lean()

    if (!contest) {
        throw new Error('Contest not found.')
    }

    const {owner, repo} = contest
    const url = LinkParser.getFulLink({owner, repo})

    return Object.assign({}, contest, {url})
}

exports.getListTasks = async (contestId) => {
    const Task = getModel('Task')
    const Camper = getModel('Camper')

    const tasks = await Task
        .find({
            contest: contestId
        })
        .populate({
            path: 'camper',
            model: Camper,
            select: ''
        })
        .sort({
            updated: 1
        })
        .lean()

    const vTasks = tasks.map((task) => {
        const {camper} = task
        if (!camper || !camper.username) return task


        const {username} = camper
        const url = `https://github.com/${username}`
        const vCamper = Object.assign({}, camper, {url})

        return Object.assign({}, task, {camper: vCamper})
    })

    return {
        tasks: vTasks,
    }
}

exports.getListIssues = async (contestId) => {
    const Issue = getModel('Issue')
    const Camper = getModel('Camper')

    const issues = await Issue
        .find({
            contest: contestId
        })
        .populate({
            path: 'camper',
            model: Camper,
            select: ''
        })
        .sort({
            created: 1
        })
        .lean()


    return {
        issues,
    }
}
