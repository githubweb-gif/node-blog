const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 2,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        // admin 超级管理员 normal 普通用户
        default: 'admin',
        enum: ['admin', 'normal']
    },
    token: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    // 状态
    status: {
        // false 未激活 true 激活
        type: Boolean,
        required: true,
        default: true
    }
});

const User = mongoose.model('User', userSchema)

const pwdHash = async function (data, token) {
    let salt = await bcrypt.genSalt(10);
    let pwd = await bcrypt.hash(data.password, salt);
    await User.create({
        username: data.name,
        password: pwd,
        role: 'normal',
        token: token,
        email: data.email,
        avatar: "/img/upload_ba401f020e14e35c8148fe956866d0e9.gif"
    })
};
function token(data, Info) {
    let info = { name: data.name };
    let key = 'vue';
    let tokens = jwt.sign(info, key, {
        expiresIn: '4h'
    });
    let datas = {
        data: {
            token: tokens,
            userInfo: Info
        },
        code: 20000
    }
    return datas
}
// pwdHash();
module.exports = {
    User,
    pwdHash,
    token
}