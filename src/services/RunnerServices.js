const request = require('request-promise-native')

exports.request = async (job = {}) => {
    const {id, student_repo, tester_repo, token} = Object.assign({}, job)

    const host = process.env.RUNNER_HOST || 'http://localhost:4000'

    try {
        const response = await request({
            baseUrl: host,
            uri: `/run`,
            method: 'POST',
            headers: {
                'x-token': token
            },
            data: {
                id,
                student_repo,
                tester_repo,
            }
        })

        return true
    } catch (e) {
        console.error('Request running job failed.', e.message)

        return false
    }
}

