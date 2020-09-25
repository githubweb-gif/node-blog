const mongoose = require('mongoose');

const settingShema = new mongoose.Schema({
    // 网站图标
    icon: {
        type: String
    },
    // 网站名称
    Name: {
        type: String,
        required: true
    },
    // 开启评论
    comment: {
        type: Boolean,
        default: false
    },
    // 评论审核
    Review: {
        type: Boolean,
        default: false
    },
    mark: {
        type: Number,
        default: 0
    }
});

const Setting = mongoose.model('Setting', settingShema)

// Setting.create({
//     Name: '葡萄Blog'
// })

module.exports = {
    Setting
}