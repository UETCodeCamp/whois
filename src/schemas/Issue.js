const {Schema} = require('mongoose')

const Issue = new Schema({
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

    github_id: {
        type: String,
        trim: true,
        index: true,
        default: ''
    },

    title: {
        type: String,
        trim: true,
        default: ''
    },

    body: {
        type: String,
        trim: true,
        default: ''
    },

    source: {
        type: String,
        trim: true,
        default: ''
    },

    is_parsed: {
        type: Boolean,
        default: false,
        index: true,
    },

    is_queued: {
        type: Boolean,
        default: false,
    },

    is_pass: {
        type: Boolean,
        default: false,
        index: true,
    },

    status: {
        type: String,
        trim: true,
        index: true,
        enum: ['pending', 'processing', 'processed'],
        default: 'pending'
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

Issue.index({status: 1, is_parsed: true, is_queued: true})

module.exports = Issue
