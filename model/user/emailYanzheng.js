const mongoose = require('mongoose')
const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
})

const Email = mongoose.model('Email', emailSchema)

module.exports = {
  Email
}
