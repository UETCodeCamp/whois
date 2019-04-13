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

    status: {
        type: String,
        default: 'active',
        index: true,
    },

    deadline: {
        type: Date,
        default: () => {
            return Date.now() + 7 * 24 * 3600 * 1000
        }
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
