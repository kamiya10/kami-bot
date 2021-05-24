module.exports = {
    log: {
        command: require('./log/command'),
        dm: require('./log/dm'),
        error: require('./log/error'),
        mention: require('./log/mention'),
        stat: require('./log/stat')
    }
}