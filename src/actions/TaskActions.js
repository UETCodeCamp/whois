const {getModel} = require('../connections/database')

exports.getTask = async ({camper = '', contest = ''}) => {
    const Task = getModel('Task')
    const exist = await Task.findOne({camper, contest}).lean()
    if (exist) return exist

    const newCamper = new Task({
        camper,
        contest
    })
    const doc = await newCamper.save()

    return doc.toJSON()
}

