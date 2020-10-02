const mongoose = require('mongoose');

const labelShema = new mongoose.Schema({
    // 标签
    title: {
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
    }
});

const Label = mongoose.model('Label', labelShema)

module.exports = {
    Label
}