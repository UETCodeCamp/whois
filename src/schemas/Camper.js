const {Schema} = require('mongoose')

const Camper = new Schema({
    username: {
        type: String,
        required: true,
        index: true,
    },

    github_id: {
        type: String,
        index: true,
        default: '',
        unique: true,
    },

    display_name: {
        type: String,
        default: ''
    },

    updated: {
        type: Date,
        default: Date.now,
    },

    created: {
        type: Date,
        default: Date.now,
        index: true,
    },
})

module.exports = Camper
