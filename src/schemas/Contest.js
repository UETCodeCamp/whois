const {Schema} = require('mongoose')

const Contest = new Schema({
    owner: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },

    repo: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },

    input: {
        type: Schema.Types.Mixed,
        default: {}
    },

    output: {
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

Contest.index({repo: 1, owner: 1})

module.exports = Contest
