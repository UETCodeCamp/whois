const contest = require('./workers/contest')

const _delay = async (time = 1000) => {
    console.log(`Delay ${time} ms...`)

    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}

const _syncContests = async () => {
    console.log('Start syncing contests.')

    try {
        await contest.syncAllContests()
        await _delay(5000)

        return _syncContests()
    } catch (error) {
        await _delay(30000)

        return _syncContests()
    }
}

const _register = async () => {
    await _syncContests()
}

const _run = async () => {
    console.log('Workers is running...')

    await _register()
}


setTimeout(async () => {
    await _run()
}, 0)
