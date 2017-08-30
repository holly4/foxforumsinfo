

var url = 'http://www.foxnews.com/opinion/2017/08/26/was-unwed-teen-and-had-to-tell-my-pastor-father-what-happened-next-was-incredible-shock.html';

const cheerio = require('cheerio');
var story_req = require('request');

story_req(url, function (error, response, body) {
  //console.log('error:', error); // Print the error if one occurred 
  //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
  //console.log('body:', body); // Print the HTML for the Google homepage. 

    const $ = cheerio.load(body);  
    console.log($("#commenting").length);
});

