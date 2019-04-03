const Mongoose = require('mongoose')

if (process.env.NODE_ENV !== 'production') {
    Mongoose.set('debug', true)
}

Mongoose.set('useCreateIndex', true)

/**
 * Connect to database.
 *
 * @param uri string
 * @param options
 * @returns {Connection}
 */
module.exports = (uri, options = {}) => {
    if (!uri) {
        throw new Error("'uri' is required.")
    }

    const defaultOptions = {
        useCreateIndex: true,
        useNewUrlParser: true
    }

    const optionValidated = Object.assign(defaultOptions, options)

    // If the node process ends, close the mongoose connection
    process.on('SIGTERM', () => {
        Mongoose.connection.close(() => {
            console.log('Mongo Database disconnected through app termination.')
        })
    })

    const connection = Mongoose
        .createConnection(uri, optionValidated)

    connection.on('connected', () => {
        console.log('MongoDB is connected.')
    })

    connection.on('connecting', () => {
        console.log('MongoDB is connecting.')
    })

    connection.on('disconnecting', () => {
        console.log('MongoDB is disconnecting.')
    })

    connection.on('disconnected', () => {
        console.log('MongoDB is disconnected.')
    })

    connection.on('error', (error) => {
        console.error('MONGODB_ERROR', error)
        process.exit(1)
    })

    return connection
}
