const { Sort } = require('../model/sort/sort')
const pagination = require('mongoose-sex-page');

module.exports = async (req, res) => {
    if (req.query.nowPage !== undefined) {
        const { nowPage, pages } = req.query
        const sorts = await pagination(Sort).find().page(nowPage).size(pages).display().exec();
        console.log(sorts);
        res.send({ data: sorts, code: 20000 });
    } else {
        const sorts = await Sort.find();
        res.send({ data: sorts, code: 20000 });
    }
}