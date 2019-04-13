const express = require('express')
const app = express()
const logger = require('morgan')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const compression = require('compression')
const cors = require('cors')

/**
 * Express configuration.
 */
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(compression())
app.use(bodyParser.json())
app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(errorHandler())
app.use(cors())

/**
 * Start Express server.
 */
setTimeout(async () => {
    /**
     * Config routes.
     */
    app.use(require('./app.routes'))

    const server = require('http').createServer(app)
    const port = process.env.PORT || 2000
    server.listen(port, () => {
        console.log(`Listening on port ${port}...`)
    })
}, 0)



