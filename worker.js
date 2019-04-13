/**
 * Load configs.
 */
const pathConfig = process.env.NODE_ENV === 'production' ? 'production.env' : 'dev.env'
require('dotenv').config({
    path: pathConfig
})

/**
 * Run worker.
 */
require('./src/worker').run()
