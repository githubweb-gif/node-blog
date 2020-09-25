const mongoose = require('mongoose');

const articleShema = new mongoose.Schema({
    title: {
        type: String,
        maxlength: 30,
        minlength: 4,
        required: [true, '请填写标题']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, '请传递作者']
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    // 修改时间
    updateAt: {
        type: Date,
        default: Date.now
    },
    cover: {
        type: String,
        default: null
    },
    content: {
        type: String,
        required: true
    },
    state: {
        // 0 未激活 1 激活
        type: Number,
        required: true,
        default: 0
    },
    // 所属分类
    sorts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sort',
        required: [true, '分类信息不存在']
    },
    meta: {
        // 看过数量
        views: { type: Number, default: 0 },
        // 喜欢数量
        likes: { type: Number, default: 0 },
        // 评论数量
        comments: { type: Number, default: 0 }
    }
});

const Article = mongoose.model('Article', articleShema)

module.exports = {
    Article
}