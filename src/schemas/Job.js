const {Schema} = require('mongoose')

const Job = new Schema({
    issue: {
        type: Schema.Types.ObjectId,
        ref: 'Issue',
        required: true,
        index: true,
    },

    student_repo: {
        type: String,
        default: ''
    },

    tester_repo: {
        type: String,
        default: ''
    },

    status: {
        type: String,
        index: true,
        default: 'pending',
        trim: true,
    },

    is_pass: {
        type: Boolean,
        default: false,
    },

    message: {
        type: String,
        default: ''
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


module.exports = Job
