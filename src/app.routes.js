const express = require('express')
const router = express.Router()


router.get('/', (req, res) => res.send('Hello, world!'))


const contest = require('./controllers/contest')
router.get('/contests', contest.getListContests)
router.post('/contests', contest.createContest)
router.get('/contests/:id', contest.getContestDetail)
router.get('/contests/:id/tasks', contest.getListTasks)
router.get('/contests/:id/issues', contest.getListIssues)

/**
 * 404 page.
 */
router.get('*', (req, res) => res.redirect('/'))

/**
 * Exports.
 */
module.exports = router
