const { Label } = require('../model/label/label')
const pagination = require('mongoose-sex-page');

module.exports = async (req, res) => {
    if (req.query.nowPage !== undefined) {
        const { nowPage, pages } = req.query
        const sorts = await pagination(Label).find().page(nowPage).size(pages).display().exec();
        console.log(sorts);
        res.send({ data: sorts, code: 20000 });
    } else {
        const sorts = await Label.find();
        res.send({ data: sorts, code: 20000 });
    }
}