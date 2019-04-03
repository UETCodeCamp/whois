const path = require('path')

/**
 * Load configs.
 */
const pathConfig = process.env.NODE_ENV === 'production' ? 'production.env' : path.join(__dirname, '/../dev.env')
require('dotenv').config({
    path: pathConfig
})

const GitHubServices = require('../src/services/GitHubServices')

setTimeout(async () => {

    const issues = await GitHubServices.issues({owner: 'tutv', repo: 'tets-whois'})

    const x = issues.map(issue => {
        const {id, title, body, user} = issue
        const {id: userId, login} = Object.assign({}, user)

        return {
            id,
            title,
            body,
            user: {
                id: userId,
                login
            },
        }
    })

    console.log(x)
}, 0)