exports.feeds = function () {
    // http://feeds.foxnews.com/foxnews/most-popular
    // http://feeds.foxnews.com/foxnews/most-popular
    _feeds = [
        {name: "*Home_Page*", url: "http://www.foxnews.com"}, 
        {name: "Most_Popular", url: "http://feeds.foxnews.com/foxnews/most-popular"},
        {name: "Entertainment", url: "http://feeds.foxnews.com/foxnews/entertainment"},
        {name: "Health", url: "http://feeds.foxnews.com/foxnews/health"},
        {name: "Lifestyle", url: "http://feeds.foxnews.com/foxnews/section/lifestyle"},
        {name: "Opinion", url: "http://feeds.foxnews.com/foxnews/opinion"},
        {name: "Politics", url: "http://feeds.foxnews.com/foxnews/politics"},
        {name: "Science", url: "http://feeds.foxnews.com/foxnews/science"},
        {name: "Sports", url: "http://feeds.foxnews.com/foxnews/sports"},
        {name: "Tech", url: "http://feeds.foxnews.com/foxnews/tech"},
        {name: "Travel", url: "http://feeds.foxnews.com/foxnews/internal/travel/mixed"},
        {name: "U.S.", url: "http://feeds.foxnews.com/foxnews/national"},
        {name: "Video", url: "http://feeds.foxnews.com/foxnews/video"},
        {name: "World", url: "http://feeds.foxnews.com/foxnews/world"},
        {name: "*Todd_Starnes*", url: "http://www.foxnews.com/person/s/todd-starnes.html"},        
    ];

    return _feeds;
};

const cheerio = require('cheerio');
const _ = require('underscore-node');
var request = require('request');
const feedPage = 'http://www.foxnews.com/about/rss/';
feeds = [];

request(feedPage, function (error, response, body) {

    if (!error) {
        const $ = cheerio.load(body);
        var lis = $('#content-related').find('a');
        var lis1 = _.rest(lis, 1);
        _.each(lis1, function (_a) {
            var a = $(_a);
            feeds.push( { name: a.text(), url : a.attr('data-url') } );
        });
    } else {
        console.log(feeds, ": ", error);
    }
});