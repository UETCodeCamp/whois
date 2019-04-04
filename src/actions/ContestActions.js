const {getModel} = require('../connections/database')

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

