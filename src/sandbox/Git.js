const simpleGit = require('simple-git')
const path = require('path')
const uuid = require('uuid/v4')
const rimraf = require('rimraf')

const _getDir = () => {
    return path.join(__dirname, '../.temp')
}

const _clear = (dir) => {
    console.log('Removing ', dir)

    return new Promise((resolve, reject) => {
        rimraf(dir, (error) => {
            if (error) {
                return reject(error)
            }

            return resolve(true)
        })
    })
}

exports.clone = async (source = '') => {
    const dir = _getDir()
    const git = simpleGit(dir)
    const localDir = uuid()
    const pathLocal = path.join(dir, localDir)
    await _clear(pathLocal)

    try {
        console.log('Cloning project', source)
        await git.silent(true).clone(source, localDir)
        const gitFolder = path.join(dir, localDir, '.git')
        await _clear(gitFolder)

        return pathLocal
    } catch (e) {
        throw e
    }
}

exports.clear = _clear
