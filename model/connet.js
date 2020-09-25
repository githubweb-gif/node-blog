const mongoose = require('mongoose')
// mongoose.connect('mongodb://vue:vue@localhost/Vblog').then(() => {
//     console.log('数据库连接成功')
// }).catch(() => {
//     console.log('数据库连接失败')
// })
mongoose.set('useCreateIndex', true)
mongoose
  .connect('mongodb://localhost/Vblog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('数据库连接成功')
  })
  .catch(() => {
    console.log('数据库连接失败')
  })
