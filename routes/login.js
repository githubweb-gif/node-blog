const express = require('express');
const { User, pwdHash, token } = require('../model/user/user');
const login = express.Router();
const bcrypt = require('bcryptjs');
// 发送邮箱验证码
const { main } = require('../model/email');
// 注册或登陆时把验证码存入临时数据库，供后续注册或登录验证使用
const { Email } = require('../model/user/emailYanzheng');

// 登录
login.post('/', async (req, res) => {
    let user = await User.findOne({ username: req.body.username });
    // 登录验证及用户登录状态验证
    if (user) {
        // 验证密码
        const isvalid = await bcrypt.compare(req.body.password, user.password);
        if (isvalid) {
            // 设置token
            user.password = '';
            const uToken = token({ name: req.body.username }, user);
            res.send(uToken)
        } else {
            res.send({ data: { message: '用户登录失败' }, code: 400 })
        }
    } else {
        res.send({ data: { message: '用户不存在, 请注册' }, code: 400 })
    }
});

// 用户注册
login.post('/registered', async (req, res) => {
    const info = await Email.findOne({ email: req.body.email.trim() });
    let user = await User.findOne({ email: req.body.email.trim() });
    let users = await User.findOne({ username: req.body.name.trim() });
    console.log(user)
    if (user || users) {
        res.send({ data: { message: '用户名已存在或邮箱错误' }, code: 400 });
        return false;
    }
    if (info) {
        let date = new Date(info.time);
        let date1 = new Date();
        let guoqi = (date1.getTime() - date.getTime());
        console.log(guoqi)
        if (guoqi > 2 * 60 * 1000 && info.code === req.body.Captcha) {
            res.send({ data: { message: '验证码错误, 请重新获取验证码' }, code: 400 });
        } else {
            const uToken = token({ name: req.body.username });
            // 创建用户
            pwdHash(req.body, uToken.data.token).then(async () => {
                await Email.deleteOne({ email: req.body.email.trim() });
                res.send({ data: { message: '注册成功' }, code: 20000 });
            }).catch(async (err) => {
                await Email.deleteOne({ email: req.body.email.trim() });
                res.send({ data: { message: '注册失败' }, code: 400 })
            });
        }
    } else {
        res.send({ data: { message: '验证码错误或用户信息错误，请检查' }, code: 400 })
    }
})

// 注册邮箱验证码
login.get('/email', async (req, res) => {
    let user = await User.findOne({ email: req.query.data.trim() });
    if (user) {
        res.send({ data: { message: '用户已存在' }, code: 400 })
        return false
    }
    main(req.query.data).then(async (data) => {
        const info = await Email.findOne({ email: req.query.data });
        if (info) {
            const date = new Date();
            await Email.updateOne({ email: req.query.data }, { code: data, time: date });
        } else {
            console.log(data)
            await Email.create({ email: req.query.data, code: data });
        }
        res.send({ data: { message: '邮件已发送，请注意查收' }, code: 20000 })
    }).catch((err) => {
        console.log(err)
        res.send({ data: { message: '重新获取邮件' }, code: 400 })
    })
})

// 重置密码
login.put('/resetPwd', async (req, res) => {
    console.log(req.body)
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        res.send({ data: { message: '用户不存在' }, code: 400 })
        return false
    } else {
        const info = await Email.findOne({ email: req.body.email });
        if (!info) {
            res.send({ data: { message: '验证码错误' }, code: 400 });
        }
        let date = new Date(info.time);
        let date1 = new Date();
        let guoqi = (date1.getTime() - date.getTime());
        if (info && info.code === req.body.Captcha && guoqi <= 2 * 60 * 1000) {
            let salt = await bcrypt.genSalt(10);
            let pwd = await bcrypt.hash(req.body.pass, salt);
            User.updateOne({ email: req.body.email }, { password: pwd }).then(async () => {
                await Email.deleteOne({ email: req.body.email.trim() });
                res.send({ data: { message: '修改成功' }, code: 20000 });
            }).catch(async () => {
                await Email.deleteOne({ email: req.body.email.trim() });
                res.send({ data: { message: '修改失败' }, code: 400 });
            })
        } else {
            res.send({ data: { message: '验证码错误, 请重新获取验证码' }, code: 400 });
        }
    }
})

// 重置密码邮箱验证码
login.get('/resetEmail', async (req, res) => {
    let user = await User.findOne({ email: req.query.data });
    if (!user) {
        res.send({ data: { message: '用户不存在' }, code: 400 })
        return false
    }
    main(req.query.data).then(async (data) => {
        const info = await Email.findOne({ email: req.query.data });
        if (info) {
            const date = new Date();
            await Email.updateOne({ email: req.query.data }, { code: data, time: date });
        } else {
            console.log(data)
            await Email.create({ email: req.query.data, code: data });
        }
        res.send({ data: { message: '邮件已发送，请注意查收' }, code: 20000 })
    }).catch((err) => {
        console.log(err)
        res.send({ data: { message: '重新获取邮件' }, code: 400 })
    })
})

// 查询用户信息
login.get('/userInfo', async (req, res) => {
    // 总的文章数
    const user = await User.findOne({ email: req.query.email });
    if (user) {
        res.send({
            data: '用户存在',
            code: 20000
        })
    } else {
        res.send({
            data: { message: '用户不存在' },
            code: 400
        })
    }

})

module.exports = login;
