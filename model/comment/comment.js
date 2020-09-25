const mongoose = require('mongoose');

const commonSchema = new mongoose.Schema({
    // 评论人
    commentator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 被评论人
    commentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        minlength: 4,
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    // 审核是否通过 0通过 1禁止
    state: {
        type: Number,
        default: 0
    },
    // 评论创建时间
    createAt: {
        type: Date,
        default: Date.now
    }
});

const Comment = mongoose.model('Comment', commonSchema);

// Comment.create({
//     author: '5e7f16be7d6fe953fc7a097c',
//     content: '13gdfgdfvbxsdfafsdagfcgbcbvx',
//     post: '5e82eed3d7a3db2480d9127c',
//     state: 0
// })

module.exports = {
    Comment
}