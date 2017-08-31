// REST Service ------------------------------

var port = process.env.PORT || 8080;

var restify = require('restify');
var data = {};

var feeds = require('./feeds').feeds();

function respond(req, res, next) {
  res.send(JSON.stringify(data));
  next();
}

function respondFeeds(req, res, next) {
  res.send(JSON.stringify(feeds));
  next();
}

var server = restify.createServer();

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

const corsMiddleware = require('restify-cors-middleware')

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['*'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
})

server.pre(cors.preflight)
server.use(cors.actual)
server.get('/stories', respond);
server.head('/stories', respond);
server.get('/feeds', respondFeeds);
server.head('/feeds', respondFeeds);

server.listen(port, function () {
  console.log('%s listening at %s', server.name, server.url);
});

// Feed Scanner  ------------------------------
//var feedUrl = 'http://feeds.foxnews.com/foxnews/most-popular';

var index = 0;

function onMinute() {
  index = (index >= feeds.length) ? 0 : index;
  FoxFeedScanner(feeds[index++]);
}
// once per minute plus one right away
//setInterval(FoxFeedScanner, 60000, feedUrl);
setTimeout(onMinute, 1000);
setInterval(onMinute, 60000);

function FoxFeedScanner(feed) {
  console.log(feed.url);
  stories = [];

  var now = new Date();

  stories.push({
    title: now.toISOString(),
    date: now.toISOString(),
    description: "",
    url: "",
    hasComments: false
  });

  var FeedParser = require('feedparser');
  var request = require('request'); // for fetching the feed

  var feedReq = request(feed.url)
  var feedparser = new FeedParser();

  feedReq.on('error', function (error) {
    // handle any request errors
  });

  feedReq.on('response', function (res) {
    console.log(feed.url);
    var stream = this; // `this` is `req`, which is a stream

    if (res.statusCode !== 200) {
      this.emit('error', new Error('Bad status code'));
    } else {
      stream.pipe(feedparser);
    }
  });

  feedparser.on('error', function (error) {
    // always handle errors
  });

  const cheerio = require('cheerio');

  function handleItem(item, total) {
    var story_req = require('request');

    story_req(item.guid, function (error, response, body) {

      compvared++;

      if (!error) {
        const $ = cheerio.load(body);
        const hasComments = $("#commenting").length > 0;

        stories.push({
          title: item.title,
          date: item.date,
          description: item.description,
          url: item.guid,
          hasComments: hasComments
        });

        console.log(compvared, ": ", hasComments, item.guid);

        if (total == compvared) {
          console.log("***" + now.getUTCDate() + " compvared ***");
          data[feed.name] = stories;
        }
      } else {
        console.log(compvared, ": ", error);
      }
    });
  }

  var compvared = 0;
  var items = [];

  feedparser.on('readable', function () {
    // This is where the action is!
    var stream = this; // `this` is `feedparser`, which is a stream
    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    var item;
    var line = "---------------------------------------------------------------------------------------------------------------";

    while (item = stream.read()) {
      items.push(item);
    };
  });


  function myFunc(arg) {
    clearTimeout(timer);
    console.log(arg.length, " items");
    for (var i = 0; i < arg.length; i++) {
      var item = arg[i];
      //console.log(item.guid);
      handleItem(item, arg.length);
    }
  }

  var timer = setTimeout(myFunc, 5000, items);
};