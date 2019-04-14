const request = require('request-promise-native')

const _getSecretKey = () => {
    const secretKey = process.env.RUNNER_SECRET || '__no_secret'

    return (secretKey + '').trim()
}

/**
 * @param job
 * @param runner
 * @return {Promise<boolean>}
 */
exports.request = async (job = {}, runner = 'node-stdout') => {
    const {id, student_repo, tester_repo} = Object.assign({}, job)

    const host = process.env.RUNNER_HOST || 'http://localhost:4000'
    const secretKey = _getSecretKey()

    try {
        const response = await request({
            baseUrl: host,
            uri: `/run/${runner || 'node-stdout'}`,
            method: 'POST',
            headers: {
                'x-secret': secretKey
            },
            body: {
                id,
                student_repo,
                tester_repo,
            },
            json: true
        })

        return true
    } catch (e) {
        console.error('Request running job failed.', e.message)

        return false
    }
}

exports.isValid = (secretKey) => {
    if (!secretKey) return false

    const key = _getSecretKey()

    return (secretKey === key)
}

