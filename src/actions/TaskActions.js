const {getModel} = require('../connections/database')

exports.getTask = async ({camper = '', contest = '', is_pass = false, message = ''}) => {
    const Task = getModel('Task')
    const exist = await Task.findOne({camper, contest}).lean()
    if (exist) {
        return exist
    }

    const newCamper = new Task({
        camper,
        contest,
        is_pass: !!is_pass,
        message: message || ''
    })
    const doc = await newCamper.save()

    return doc.toJSON()
}

exports.updateTask = async (id, updateData = {}) => {
    const Task = getModel('Task')
    const exist = await Task.findOne({_id: id}).lean()
    if (!exist) {
        throw new Error('Task not found.')
    }

    const updated = Object.assign({}, updateData)
    if (!Object.keys(updated).length) {
        return true
    }

    await Task.updateOne(
        {_id: id},
        {
            $set: updated,
        }
    )

    return true
}
