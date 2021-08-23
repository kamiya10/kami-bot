module.exports = {
    info: {
        avatar: require("./info/avatar"),
        help: require("./info/help"),
        prefix: require("./info/prefix"),
        userinfo: require("./info/userinfo"),
        where: require("./info/where"),
        _prop: {
            name: "資訊類指令"
        }
    },
    music: {
        leave: require("./music/leave"),
        loop: require("./music/loop"),
        nowplaying: require("./music/nowplaying"),
        pause: require("./music/pause"),
        play: require("./music/play"),
        queue: require("./music/queue"),
        resume: require("./music/resume"),
        skip: require("./music/skip"),
        synclyric: require("./music/synclyric"),
        volume: require("./music/volume"),
        _prop: {
            name: "音樂類指令"
        }
    },
    utils: {
        ping: require("./utils/ping"),
        poll: require("./utils/poll"),
        sauce: require("./utils/sauce"),
        saucenao: require("./utils/saucenao"),
        waifu2x: require("./utils/waifu2x"),
        _prop: {
            name: "功能類指令"
        }
    },
    bot: {
        bug: require("./bot/bug"),
        suggest: require("./bot/suggest"),
        _prop: {
            name: "機器人相關指令"
        }
    },
    admin: {
        chatreply: require("./admin/chatreply"),
        message: require("./admin/message"),
        purge: require("./admin/purge"),
        voice: require("./admin/voice"),
        _prop: {
            name: "管理類指令"
        }
    }
};