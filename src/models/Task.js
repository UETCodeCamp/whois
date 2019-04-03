const {Schema} = require('mongoose')

const Task = new Schema({
    camper: {
        type: Schema.Types.ObjectId,
        ref: 'Camper',
        required: true,
        index: true,
    },

    contest: {
        type: Schema.Types.ObjectId,
        ref: 'Contest',
        required: true,
        index: true,
    },

    is_pass: {
        type: Boolean,
        default: false,
        index: true
    },

    message: {
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
