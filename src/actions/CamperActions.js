const {getModel} = require('../connections/database')

exports.getCamper = async ({username = '', github_id = ''}) => {
    const Camper = getModel('Camper')
    const exist = await Camper.findOne({github_id}).lean()
    if (exist) return exist

    const newCamper = new Camper({
        username,
        github_id
    })
    const doc = await newCamper.save()

    return doc.toJSON()
}

