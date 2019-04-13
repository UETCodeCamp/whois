module.exports = async (time = 1000) => {
    console.log(`Delay ${time} ms...`)

    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}
