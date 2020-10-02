const mongoose = require('mongoose');

const sortShema = new mongoose.Schema({
    // 标签
    className: {
        type: String,
        maxlength: 30,
        minlength: 2,
        required: true,
        // 唯一性
        unique: true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    // 分类介绍
    Introduction: {
        type: String,
        maxlength: 60,
        required: true
    }

});

const Sort = mongoose.model('Sort', sortShema)

module.exports = {
    Sort
}