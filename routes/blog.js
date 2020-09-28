const express = require('express');
const blog = express.Router();
const { User } = require('../model/user/user');
const { Article } = require('../model/article/article');
const { Sort } = require('../model/sort/sort');
const pagination = require('mongoose-sex-page');
const { Statistics } = require('../model/webCount');
const { Setting } = require('../model/setting/setting');
const mongoose = require('mongoose');
const { Comment } = require('../model/comment/comment');

// 按页查询所有文章
blog.get('/article', async (req, res) => {
    let regexp = new RegExp(req.query.searchKey, 'i');
    const {
        nowPage = 1,
        size = 6
    } = req.query;
    const article = await pagination(Article).find({ $or: [{ title: { $regex: regexp } }] }).sort({ createAt: -1 }).page(nowPage).size(size).display()
        .populate([{ path: 'author', select: 'username' },
        { path: 'sorts', select: 'title' }]).exec();
    function removeTAG(str) {
        // return str.replace(/<[^>]+>/g, "");
        // 返回前言
        const i = str.indexOf('<p');
        const l = str.indexOf('</p>')
        if (i !== -1 && l !== -1) {
            const preface = str.substring(i, l + 4);
            return preface.replace(/<[^>]>/g, '')
        }
    }
    const arr = article.records;
    arr.forEach((item, index) => {
        const text = removeTAG(item['content']);
        item['content'] = text;
    });
    res.send({ data: article, code: 200 });
})

blog.get('/allArticle', (req, res) => {
    Article.find().select(['createAt', 'title', 'meta.views']).sort({ 'createAt': -1 }).then((data) => {
        res.send({ data, code: 200 })
    })
})

// 查询热门文章
blog.get('/hot', async (req, res) => {
    const data = await pagination(Article).find().sort({ 'mata.views': 1 }).select('title').page(1).size(10).display().exec();
    res.send({ data: data.records, code: 200 })
})

// /:id查询wenzhang
// 同时返回上下篇
blog.get('/article/:id', async (req, res) => {
    const id = req.params['id']
    const article = await Article.findOne({ _id: id }).populate([{ path: 'author', select: 'username' },
    { path: 'sorts', select: 'title' }]);
    console.log(article)
    // 上一条
    const previous = await Article.find({ createAt: { $lt: article.createAt } }, { _id: 1, title: 1 }).sort({ createAt: -1 }).limit(1)
    // 下一条
    const next = await Article.find({ createAt: { $gt: article.createAt } }, { _id: 1, title: 1 }).sort({ createAt: 1 }).limit(1)
    res.send({ data: { article, previous, next }, code: 200 })
})
// 阅读数
blog.put('/views/:id', async (req, res) => {
    const id = req.params['id'];
    // 阅读数+1
    const article = await Article.updateOne({ _id: id }, { $inc: { 'meta.views': 1 } });
    // 总阅读数+1
    await Statistics.update({}, { $inc: { ArticleViews: 1 } });
    res.send({ data: article, code: 200 })
})

// 获取所有分类
blog.get('/sort', async (req, res) => {
    const sorts = await Sort.find();
    res.send({ data: sorts, code: 200 })
})

// 获取分类文章
blog.get('/sort/:id', async (req, res) => {
    const id = req.params['id'];
    const {
        nowPage = 1,
        size = 6
    } = req.query;
    const sorts = await pagination(Article).find({ sorts: id }).page(nowPage).size(size).display()
        .populate([{ path: 'author', select: 'username' },
        { path: 'sorts', select: 'title' }]).exec();
    function removeTAG(str) {
        return str.replace(/<[^>]+>/g, "");
    }
    const arr = sorts.records;
    arr.forEach(item => {
        for (let k in item) {
            if (k === 'content') {
                const text = removeTAG(item[k]);
                item[k] = text.substring(0, 150);
            }
        }
    });
    res.send({ data: sorts, code: 200 })
})

// 网站数据统计Statistics
blog.get('/Statistics', async (req, res) => {
    const statistics = await Statistics.findOne();
    if (statistics) {
        res.send({ data: statistics, code: 20000 })
        return
    };
    const data = await Statistics.create({});
    res.send({ data: data, code: 20000 })
})

// 修改网站数据统计
blog.put('/Statistics', async (req, res) => {
    const views = req.headers['x-views'];
    if (views) {
        res.send({ data: 'data', code: 200 })
    } else {
        const vv = await Statistics.find();
        const id = mongoose.Types.ObjectId(vv[0]._id);
        Statistics.updateOne({ _id: id }, { $inc: { Pageviews: 1 } }).then((data) => {
            res.send({ data: data, code: 200 })
        })
    }
})

// 获取网站设置
blog.get('/setting', async (req, res) => {
    const info = await Setting.findOne({ mark: 0 }).select(['-comment', '-Review']);
    res.send({ data: info, code: 20000 })
})

// 添加文章评论
blog.post('/comment', (req, res) => {
    const { Pid, Bid, content, Aid } = req.body;
    Comment.create({ commentator: Pid, commentee: Bid, content, article: Aid }).then((data) => {
        res.send({ data: '评论已被创建', code: 20000 })
    }).catch((err) => {
        res.send({ data: '评论创建失败', code: 400 })
    })
})

// 获取文章评论
blog.get('/comment', (req, res) => {
    const { Pid, Bid, content, Aid } = req.body;
    Comment.find().then((data) => {
        res.send({ data, code: 20000 })
    }).catch((err) => {
        res.send({ data: '获取评论失败', code: 400 })
    })
})

module.exports = blog
