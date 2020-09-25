const express = require('express');
const app = express();
const admin = require('./routes/admin');
const blog = require('./routes/blog');
const login = require('./routes/login')
const normal = require('./routes/normal');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('./model/connet');
require('./model/sort/sort');
const path = require('path');

// 开放静态资源
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', function (req, res, next) {
    // var orginList = [
    //     "http://www.putao.work",
    //     "http://admin.putao.work"
    // ];
    // if (orginList.includes(req.headers.origin.toLowerCase())) {
    //     //设置允许跨域的域名，*代表允许任意域名跨域
    //     res.header("Access-Control-Allow-Origin", req.headers.origin);
    // };
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Views')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Token')
    res.setHeader('Content-Type', 'application/json;charset=utf-8')
    res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization,X-Token,X-Views, Accept,X-Requested-With')
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header('X-Powered-By', ' 3.2.1')
    if (req.method == 'OPTIONS')  res.sendStatus(200)
    /*让options请求快速返回*/ else next()
});
// 请求token验证
app.use('/admin', (req, res, next) => {
    if (req.url === '/upImg' || req.url.split('/')[1] === 'logout') {
        return next()
    };
    const token = req.headers['x-token'];
    jwt.verify(token, 'vue', (error, decoded) => {
        if (error) {
            res.send({ data: { message: '令牌过期或非法令牌' }, code: 50008 })
            return console.log(error);
        };
        next();
    })
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/admin', admin);
app.use('/blog', blog);
app.use('/login', login);
app.use('/normal', normal);
app.listen(3000, () => {
    return console.log('服务器启动成功')
});