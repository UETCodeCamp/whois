const {getModel} = require('../connections/database')

exports.updateTaskByIssue = async (issue) => {
    const {is_pass, contest, camper} = issue

    const Task = getModel('Task')
    const exist = await Task.findOne({contest}).lean()

    if (exist) {
        await Task.updateOne(
            {_id: exist._id},
            {
                $set: {
                    is_pass,
                    updated: Date.now()
                }
            }
        )

        return true
    }

    const newTask = new Task({
        is_pass,
        contest,
        camper,
    })

    await newTask.save()

    return true
}
