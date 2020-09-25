const mongoose = require('mongoose');

const sortShema = new mongoose.Schema({
    // 小分类
    title: {
        type: String,
        maxlength: 30,
        minlength: 2,
        required: true,
        // 唯一性
        unique: true
    },
    // 大分类
    className: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

const Sort = mongoose.model('Sort', sortShema)

// Sort.create({
//     title: 'ajax',
//     classNmae: 'JavaScript'
// })

module.exports = {
    Sort
}