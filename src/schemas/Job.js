const {Schema} = require('mongoose')

const Task = new Schema({
    issue: {
        type: Schema.Types.ObjectId,
        ref: 'Issue',
        required: true,
        index: true,
    },

    status: {
        type: String,
        index: true,
        trim: true,
    },

    is_pass: {
        type: Boolean,
        default: false,
    },

    std_out: {
        type: String,
        default: ''
    },

    std_err: {
        type: String,
        default: ''
    },

    meta: {
        type: Schema.Types.Mixed,
        default: {}
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


module.exports = Task
