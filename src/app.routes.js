const express = require('express')
const router = express.Router()


router.get('/', (req, res) => res.send('Hello, world!'))

/**
 * 404 page.
 */
router.get('*', (req, res) => res.redirect('/'))

/**
 * Exports.
 */
module.exports = router
