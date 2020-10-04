const express = require('express');
const { User } = require('../model/user/user');
const admin = express.Router();
const formidable = require('formidable');
const path = require('path');
const { Article } = require('../model/article/article');
const pagination = require('mongoose-sex-page');
const { Label } = require('../model/label/label');
const { Sort } = require('../model/sort/index');
const { Comment } = require('../model/comment/comment');
const { Setting } = require('../model/setting/setting');
const { ToDo } = require('../model/todo/todo');
const mongoose = require('mongoose');
const { Email } = require('../model/user/emailYanzheng');

// 用户退出
admin.put('/logout/:id', async (req, res) => {
    const id = req.params['id']
    let user = await User.findOne({ _id: id });
    res.send({ data: { message: '退出成功' }, code: 20000 })
});

// 查询文章信息和用户信息汇总
admin.get('/allInfo', async (req, res) => {
    // 总的文章数
    const article = await Article.estimatedDocumentCount();
    const user = await User.estimatedDocumentCount();
    const sort = await Sort.estimatedDocumentCount();
    res.send({
        data: {
            article,
            user,
            sort
        },
        code: 20000
    })
})

// 添加分类
admin.post('/sort', (req, res) => {
    let { className, Introduction } = req.body
    console.log(req.body)
    Sort.create({ className, Introduction }).then((info) => {
        res.send({ data: info, code: 20000 })
    }).catch((err) => {
        console.log(err)
        res.send({ data: { message: '添加文章分类错误' }, code: 400 })
    });
})

// 获取分类
admin.get('/sort', async (req, res) => {
    const { nowPage, pages } = req.query
    const sorts = await pagination(Sort).find().page(nowPage).size(pages).display().exec();
    res.send({ data: sorts, code: 20000 });
})

// 修改分类
admin.put('/sort', (req, res) => {
    let { id, data } = req.body
    Sort.updateOne({ _id: id }, data).then((info) => {
        res.send({ data: info, code: 20000 })
    }).catch(() => {
        res.send({ data: { message: '修改分类错误' }, code: 400 })
    });
})

// 刪除分类
admin.delete('/sort', (req, res) => {
    let { id } = req.body
    console.log(id)
    Sort.deleteOne({ _id: id }).then((info) => {
        res.send({ data: info, code: 20000 })
    }).catch(() => {
        res.send({ data: { message: '刪除分类错误' }, code: 400 })
    });
})

// 获取文章标签
admin.get('/label', require('./label'))

// 添加文章标签
admin.post('/label', (req, res) => {
    Label.create(req.body).then((info) => {
        res.send({ data: info, code: 20000 })
    }).catch((err) => {
        res.send({ data: { message: '文章分类错误' }, code: 400 })
    });
})
// 修改文章标签
admin.put('/label/:id', async (req, res) => {
    const id = req.params['id'];
    const data = req.body
    const info = await Label.update({ _id: id }, data);
    res.send({ data: info, code: 20000 })
})
// 删除文章标签
admin.delete('/label/:id', async (req, res) => {
    const id = req.params['id'];
    const info = await Label.deleteOne({ _id: id });
    res.send({ data: info, code: 20000 })
})
// 上传图片
admin.post('/upImg', (req, res) => {
    // 创建表单解析对象
    const form = new formidable.IncomingForm();
    // 图片上传地址
    form.uploadDir = path.join(__dirname, '../', 'public', 'img');
    /// 保留文件上传后缀
    form.keepExtensions = true;
    // 解析表单
    form.parse(req, (error, fields, files) => {
        if (error === null) {
            const ss = files.file.path.split('public')[1]
            res.send({ location: ss })
        } else {
            res.send({ data: { message: '上传头像失败' }, code: 400 })
        }
    })
})
// // 文件上传
// admin.post('/upWord', (req, res) => {
//     // 创建表单解析对象
//     const form = new formidable.IncomingForm();
//     // 图片上传地址
//     form.uploadDir = path.join(__dirname, '../', 'public', 'word');
//     // 设置文件上传大小 20m
//     form.maxFileSize = 20 * 1024 * 1024;
//     /// 保留文件上传后缀
//     form.keepExtensions = true;
//     // 解析表单
//     form.parse(req, (error, fields, files) => {
//         if (error === null) {
//             res.send({ data: files, code: 20000 })
//         }
//     })
// })
// 添加文章
admin.post('/article', (req, res) => {
    // 文章添加验证后期在做
    console.log(req.body)
    Article.create(req.body).then((userInfo) => {
        res.send({ data: userInfo, code: 20000 })
    }).catch((err) => {
        console.log(err)
        res.send({ data: { message: '文章信息错误' }, code: 400 })
    });
})
// 查询文章
admin.get('/article', async (req, res) => {
    const { nowPage, pages, sortId, labelId, state } = JSON.parse(req.query.page);
    console.log(JSON.parse(req.query.page))
    const { _id, role } = req.query;
    var obj = {};
    if (sortId !== '' && sortId) {
        var idd = mongoose.Types.ObjectId(sortId);
        obj.sorts = idd
    };
    if (labelId !== '' && labelId) {
        var idd = mongoose.Types.ObjectId(labelId);
        obj.label = idd
    };
    if (state !== '') {
        obj.state = state - 0;
    };
    if (role === 'normal') {
        var idd1 = mongoose.Types.ObjectId(_id);
        obj.author = idd1;
    };
    console.log(obj)
    let articleInfo = await pagination(Article).find(obj).select('-content', '-cover', '-meta').page(nowPage).size(pages)
        .display().populate([{ path: 'author', select: 'username' }, { path: 'sorts', select: 'className' }, { path: 'label', select: 'title' }]).exec();
    res.send({ data: articleInfo, code: 20000 })
})

// 统计文章分类数据
admin.get('/articleData', async (req, res) => {
    let articleData = await Article.find().select(['label']).populate([{ path: 'label', select: 'title' }]);
    const arr = [];
    console.log(articleData)
    for (var i = 0; i < articleData.length; i++) {
        if (articleData[i].label) {
            arr.push(articleData[i].label.title)
        }
    };
    const arrData = [];
    arr.forEach((item, index) => {
        const copyarr = [];
        var obj = {
            value: 0,
            name: ''
        };
        obj.name = item;
        copyarr[0] = item;
        for (var i = 0; i <= arr.length - 1; i++) {
            if (copyarr[0] !== 0 && copyarr[0] === arr[i]) {
                obj.value++;
                arr[i] = 0;
            }
        };
        if (obj.value === 0) {
            return;
        }
        arrData.push(obj);
    });
    res.send({ data: arrData, code: 20000 })
});

function getData(ll, datas) {
    ll.forEach((item) => {
        var date = new Date(item.createAt);
        if (date.getDay() === 0) {
            item.createAt = 6
        } else {
            item.createAt = date.getDay() - 1
        }
    });
    ll.sort(function (a, b) { return a.createAt - b.createAt });
    var oo = {
        name: '',
        data: []
    };
    ll.forEach((item) => {
        var nn = [];
        var Q = {
            n: 0,
            index: 0
        };
        if (item !== 0) {
            oo.name = item.name;
        };
        nn[0] = item;
        for (var i = 0; i < ll.length; i++) {
            if (nn[0] !== 0 && ll[i] !== 0) {
                if (ll[i].createAt === nn[0].createAt) {
                    Q.n++;
                    Q.index = ll[i].createAt;
                    ll[i] = 0;
                }
            };
        };
        if (Q.n !== 0) {
            oo.data[Q.index] = Q.n;
            Q.n = 0;
        };
    });
    datas.push(oo);
}
// 统计这一周文章数据分布
admin.get('/articleDay', async (req, res) => {
    var date = new Date();
    var date1 = new Date();
    var day = date.getDay();
    var d = date.getDate();
    var old = 0;
    // 0是周日
    if (day === 0) {
        old = d - 6
    } else {
        old = d - day + 1
    }
    date.setDate(old);
    date.setHours(0, 0, 0, 0);
    date1.setDate(d);
    let articleData = await Article.find({ createAt: { $gt: date, $lte: date1 } })
        .select(['label', 'createAt', 'state']).populate([{ path: 'label', select: 'title' }]);
    let data = [];
    var kk = [];
    articleData.forEach((item, index) => {
        const copyarr = [];
        copyarr[0] = item;
        for (var i = 0; i < articleData.length; i++) {
            if (articleData[i] !== 0) {
                if (copyarr[0] !== 0 && copyarr[0].label.title === articleData[i].label.title) {
                    var obj = {
                        name: '',
                        createAt: ''
                    };
                    obj.name = item.label.title;
                    obj.createAt = articleData[i].createAt;
                    data.push(obj);
                    articleData[i] = 0;
                };
            };
        };
        if (copyarr[0] !== 0) {
            kk.push(data);
            data = [];
        }
    });
    var datas = [];
    kk.forEach((item) => {
        getData(item, datas)
    });
    console.log(datas)
    res.send({ data: datas, code: 20000 })
})

// 查询这一周文章具体信息，不包括内容
admin.get('/articleSon', async (req, res) => {
    var date = new Date();
    var date1 = new Date();
    var day = date.getDay();
    var d = date.getDate();
    var old = 0;
    if (day === 0) {
        old = d - 6
    } else {
        old = d - day + 1
    };
    date.setDate(old);
    date.setHours(0, 0, 0, 0);
    date1.setDate(d);
    let articleData = await Article.find({ createAt: { $gt: date, $lte: date1 } })
        .select(['label', 'sorts', 'createAt', 'title', 'author'])
        .populate([{ path: 'author', select: 'username' }, { path: 'label', select: 'title' }, { path: 'sorts', select: 'className' }]);
    res.send({ data: articleData, code: 20000 })
})

// 删除文章
admin.delete('/article', async (req, res) => {
    let id = req.query['0'];
    const delInfo = await Article.deleteOne({ _id: id });
    res.send({ data: delInfo, code: 20000 })
})
//  修改文章
admin.put('/article/:id', async (req, res) => {
    const id = req.params['id'];
    const editInfo = await Article.update({ _id: id }, req.body)
    res.send({ data: editInfo, code: 20000 })
})
// 查询文章:id
admin.get('/article/:id', async (req, res) => {
    const id = req.params['id'];
    let uInfo = await Article.findOne({ _id: id }).populate([{ path: 'sorts', select: 'className' }, { path: 'label', select: 'title' }]);
    res.send({ data: uInfo, code: 20000 })
})

// 评论API

// 查询所有评论
admin.get('/comment', async (req, res) => {
    const { nowPage, pages } = req.query;
    const Comments = await pagination(Comment).find().page(nowPage).size(pages).display()
        .populate([{ path: 'author', select: 'username' }, { path: 'post', select: 'title' }]).exec();
    res.send({ data: Comments, code: 20000 })
})
// 删除评论
admin.delete('/comment/:id', async (req, res) => {
    const id = req.params['id'];
    const CommentInfo = await Comment.deleteOne({ _id: id });
    res.send({ data: CommentInfo, code: 20000 })
})
// 审核评论
admin.put('/comment/:state', async (req, res) => {
    let id = req.body.id
    let states = req.params['state'];
    if ((states - 0) === 0) {
        states = 1
    } else {
        states = 0
    }
    const Comments = await Comment.updateOne({ _id: id }, { state: states });
    res.send({ data: Comments, code: 20000 })
})
// 用户（非管理员）修改评论
// User.get('/comment', async (req, res) => {
// })

// 管理员api

// 修改用户权限(admin无法修改同级用户权限)
admin.put('/user/:id', async (req, res) => {
    let id = req.params['id']; // 登录者
    let _id = req.body.state._id; // 要被修改的
    let power = req.body.state.role;
    const status = req.body.state.status;
    // 普通用户没有权限
    // 普通用户在这个路由什么都不能更改
    // admin不能删除自己
    // admin 不能更改同级用户权限或删除同级用户
    if (id === _id || power === 'admin') {
        res.send({ data: { message: '无法修改自身权限或同级用户权限' }, code: 400 });
    } else {
        if (status !== undefined) {
            await User.updateOne({ _id: _id }, { status });
            res.send({ data: { message: '修改成功' }, code: 20000 })
        } else {
            power = 'admin';
            const userinfo = await User.updateOne({ _id: _id }, { role: power });
            res.send({ data: userinfo, code: 20000 })
        }
    }
})

//删除管理员
admin.delete('/user/:id', async (req, res) => {
    let _id = req.params['id'] // 被删除
    let { role, id } = req.query; // id 登陆者
    if (id === _id || role === 'admin') {
        res.send({ data: { message: '无权限' }, code: 400 });
        return false;
    };
    const userinfo = await User.deleteOne({ _id: _id });
    res.send({ data: userinfo, code: 20000 })
})
//获取所有管理员信息
admin.get('/user', async (req, res) => {
    const { nowPage, pages } = req.query;
    const userinfo = await pagination(User).find().select(['username', 'role', 'createTime', 'status', 'email']).page(nowPage).size(pages).display().exec();
    res.send({ data: userinfo, code: 20000 })
})
// 修改用户信息/:id
admin.put('/userInfo/:id', async (req, res) => {
    const { id } = req.params;
    const { Captcha, email } = req.body;
    const info = await User.findOne({ _id: id });
    if (req.body._id !== undefined) {
        delete req.body._id
    };
    if (Captcha !== undefined) {
        const ee = await Email.findOne({ email: info.email });
        const ee1 = await Email.findOne({ email: email });
        if (ee && ee.Captcha === Captcha.trim() && !ee1) {
            User.updateOne({ _id: id }, { email: email }).then(() => {
                res.send({ data: { message: '修改用户信息成功' }, code: 20000 })
            }).catch(() => {
                res.send({ data: { message: '修改用户信息失败' }, code: 400 })
            })
            return false;
        } else {
            res.send({ data: { message: '验证码错误或邮箱已存在' }, code: 400 });
            return false;
        }
    };
    User.updateOne({ _id: id }, req.body).then((data) => {
        res.send({ data: { message: '修改用户信息成功' }, code: 20000 })
    }).catch(() => {
        res.send({ data: { message: '修改用户信息失败' }, code: 400 })
    });
})
// 获取用户信息/:id
admin.get('/userInfo/:_id', (req, res) => {
    const { _id } = req.params;
    User.findOne({ _id: _id }).select(['-password']).then((data) => {
        res.send({ data: data, code: 20000 })
    }).catch(() => {
        res.send({ data: '获取用户信息失败', code: 400 })
    })
})

// 网站设置api
// 修改网站设置
admin.put('/setting', async (req, res) => {
    const set = await Setting.findOne({ mark: 0 });
    if (!set) {
        await Setting.create({
            Name: '葡萄Blog'
        })
    }
    let obj = req.body;
    let newObj = {};
    for (let k in obj) {
        if (obj[k] !== '') {
            newObj[k] = obj[k]
        }
    };
    const gg = await Setting.updateOne({ mark: 0 }, newObj);
    res.send({ data: '设置成功', code: 20000 })
})
// 获取网站设置
admin.get('/setting', async (req, res) => {
    const set = await Setting.findOne({ mark: 0 });
    if (!set) {
        await Setting.create({
            Name: '葡萄Blog'
        })
    }
    const info = await Setting.findOne({ mark: 0 });
    res.send({ data: info, code: 20000 })
})

// 添加todo
admin.post('/todo', async (req, res) => {
    ToDo.create(req.body).then((data) => {
        res.send({ data: '添加成功', code: 20000 })
    });
})


// 查询todo
admin.get('/todo', async (req, res) => {
    ToDo.find().then((data) => {
        res.send({ data: data, code: 20000 })
    });
})

// 修改todo
admin.put('/todo', async (req, res) => {
    const { _id, done, text } = req.body;
    ToDo.updateOne({ _id: _id }, { done, text }).then((data) => {
        res.send({ data: '修改todo成功', code: 20000 })
    });
})

// 全选和反选
admin.put('/todos', async (req, res) => {
    const todos = req.body;
    todos.forEach(async (item) => {
        await ToDo.updateOne({ _id: item._id }, { done: item.done });
    });
    res.send({ data: '修改todo成功', code: 20000 })
})

// 删除todo
admin.delete('/todo', async (req, res) => {
    const { id } = req.query;
    ToDo.deleteOne({ _id: id }).then((data) => {
        res.send({ data: '删除todo成功', code: 20000 })
    });
})

module.exports = admin