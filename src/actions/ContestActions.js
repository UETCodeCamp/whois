const {getModel} = require('../connections/database')

exports.getContest = async ({owner, repo}) => {
    const Contest = getModel('Contest')
    const exist = await Contest.findOne({owner, repo}).lean()

    if (exist) return exist

    const newContest = new Contest({
        owner,
        repo
    })

    const doc = await newContest.save()

    return doc.toJSON()
}

