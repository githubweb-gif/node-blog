const mongoose = require('mongoose');
const statistics = new mongoose.Schema({
    Pageviews: {
        type: Number,
        default: 0
    },
    ArticleViews: {
        type: Number,
        default: 0
    },
    onePageviews: {
        type: Number,
        default: 0
    },
    oneArticleViews: {
        type: Number,
        default: 0
    },
});

const Statistics = mongoose.model('Statistics', statistics);

module.exports = {
    Statistics
}
