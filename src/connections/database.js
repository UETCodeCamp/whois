const createMongoConnection = require('../libs/createMongoConnection')

const _getURI = () => {
    return process.env.MONGODB_URI || ''
}

const originConnection = createMongoConnection(_getURI(), {
    poolSize: 1
})

const _getConnection = connection => () => {
    return connection
}

const _getModel = connection => (collection = '') => {
    try {
        const Schema = require(`../schemas/${collection}`)

        return connection.model(collection, Schema)
    } catch (e) {
        console.error(e)

        process.exit(1)
    }
}

const createStore = connection => {
    return {
        getConnection: _getConnection(connection),
        getModel: _getModel(connection)
    }
}

module.exports = createStore(originConnection)
