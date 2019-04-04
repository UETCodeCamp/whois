const _getTotalTime = (req) => {
    if (!req['_PF_START_TIME']) return false

    const startTime = parseInt(req['_PF_START_TIME'], 10)
    const finishTime = Date.now()

    const totalTime = finishTime - startTime

    if (!totalTime || totalTime <= 0) return false

    return totalTime
}

exports.sendSuccess = (req, res) => result => {
    const totalTime = _getTotalTime(req)

    const response = {
        success: true,
        data: result
    }

    if (totalTime) {
        res.set('X-Query-Time', totalTime)
    }

    return res.send(response)
}

exports.sendError = (req, res) => error => {
    const totalTime = _getTotalTime(req)

    const message = typeof error === 'string' ? error : error.message || ''
    const code = error.code || false

    const result = {
        success: false,
        message
    }

    if (code) {
        result.code = code
    }

    if (totalTime) {
        res.set('X-Query-Time', totalTime)
    }

    res.send(result)
}

exports.catchError = (req, res) => error => {
    const totalTime = _getTotalTime(req)
    const message = typeof error === 'string' ? error : error.message || ''

    if (totalTime) {
        res.set('X-Query-Time', totalTime)
    }

    res.status(500).send({
        success: false,
        message
    })
}
