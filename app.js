const _ = require('underscore-node');

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

var index = 0;

function onMinute() {
  index = (index >= feeds.length) ? 0 : index;
  var feed = feeds[index++];
  if (feed.name === '*Home_Page*') {
    FoxPageScanner(feed, MainPageScanner);
  } else {
    if (feed.name === '*Todd_Starnes*') {
      FoxPageScanner(feed, PersonPageScanner);
    } else {
      FoxFeedScanner(feed);
    }
  }
}

// once per minute plus one right away
setTimeout(onMinute, 1000);
setInterval(onMinute, 60000);

function FoxFeedScanner(feed) {
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

  feedparser.on('end', function () {
    itemParser(feed, items);
  });
};

function itemParser(feed, items) {
  var compared = 0;
  var stories = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    handleItem(item, items.length);
  }

  function handleItem(item, total) {
    let cheerio =  require('cheerio');
    let moment =  require('moment');
    var story_req = require('request');

    story_req(item.guid, function (error, response, body) {
      compared++;

      if (!error) {
        const $ = cheerio.load(body);
        const hasComments = $("#commenting").length > 0;

        var title = item.title;
        if (!title) {
          title = $("h1").last().text()
        }

        var date = item.date;
        if (!date) {
          date = moment($(".date").first().attr("datetime")).toISOString();
        }

        stories.push({
          title: title,
          date: date,
          description: item.description,
          url: item.guid,
          hasComments: hasComments
        });

        //console.log(compared, ": ", hasComments, item.guid);

        if (total == compared) {
          console.log(feed.name, ": ", total + " stories");
          data[feed.name] = stories;
        }
      } else {
        console.log(compared, ": ", error);
      }
    });
  }
}

function FoxPageScanner(feed, callback) {
  let request = require('request');
  let buffer = "";

  request
    .get(feed.url)
    .on('response', function (response) {
      response
        .on('data', (chunk) => {
          buffer += chunk;
        })
        .on('end', () => {
          callback(feed, buffer);
        })
        .on('error', (err) => {
          console.log(err)
        });
    })
    .on('error', (err) => {
      console.log(err)
    });
}

function MainPageScanner(feed, body) {
  let cheerio = require('cheerio');
  stories = {};

  const $ = cheerio.load(body);
  var urls = $("a");
  var stories = {};

  _.each(urls, function (item) {
    var url = $(item).attr("href");
    if (url && url.indexOf("http://www.foxnews.com") >= 0 && url.indexOf("/2017/") > 0) {
      stories[url] = {
        title: undefined,
        date: undefined,
        description: "description",
        guid: url,
      };
    }
  });

  var items = _.values(stories);
  itemParser(feed, items);
}

function PersonPageScanner(feed, body) {
  let cheerio = require('cheerio');
  //let body = buffer.replace(/^\s*[\r\n]/gm, ""); // Buffer.concat(buffer).toString();
  //var fs = require("fs");
  //fs.writeFileSync('c:/temp/buffer.html', body);

  const $ = cheerio.load(body);
  var urls = $(".article-ct").find("a");
  var stories = {};

  _.each(urls, function (item) {
    // TODO: handle case of absolute urls
    var url = "http://www.foxnews.com" + $(item).attr("href");
    stories[url] = {
      title: undefined,
      date: undefined,
      description: "description",
      guid: url,
    };
  });

  var items = _.values(stories);
  itemParser(feed, items);
}