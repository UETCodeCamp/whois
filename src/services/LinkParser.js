exports.parseLinkGithub = (text = '') => {
    const trimmed = text ? (text + '').trim() : ''

    if (!trimmed) {
        throw new Error('Text is empty.')
    }

    const regex = /(github\.com\/.+\/\S+)/gi
    const parsed = regex.exec(trimmed)

    if (!parsed || parsed.length < 2) {
        throw new Error('Link not found.')
    }

    const link = parsed[1]
    const vLink = link ? (link + '').trim() : ''

    return vLink.indexOf('http') === -1 ? `https://${vLink}` : vLink
}
