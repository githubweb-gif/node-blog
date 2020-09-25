const mongoose = require('mongoose');

const ToDoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    done: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const ToDo = mongoose.model('ToDo', ToDoSchema);

module.exports = {
    ToDo
}