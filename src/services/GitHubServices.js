const Octokit = require('@octokit/rest')

const _getToken = () => {
    return process.env.GITHUB_TOKEN || ''
}

const _createClient = () => {
    const token = _getToken()

    const octokit = new Octokit({
        auth: () => {
            return token
        },

        throttle: {
            onRateLimit: (retryAfter, options) => {
                octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`)

                if (options.request.retryCount === 0) {
                    console.log(`Retrying after ${retryAfter} seconds!`)
                    return true
                }
            },
            onAbuseLimit: (retryAfter, options) => {
                octokit.log.warn(`Abuse detected for request ${options.method} ${options.url}`)
            }
        }
    })

    return octokit
}

exports.getClient = () => {
    return _createClient()
}

exports.issues = async ({owner, repo}) => {
    const octokit = _createClient()

    const options = octokit.issues.listForRepo.endpoint.merge({
        owner,
        repo,
        direction: 'asc'
    })

    return await octokit.paginate(options)
}


