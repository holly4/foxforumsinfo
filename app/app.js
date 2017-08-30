$(document).ready(function () {

    let parsed = {};

    console.log("requesting... ");

    $.ajax({
        url: "http://localhost:8080/stories",
        error: function (req, exception) {
            console.log(req.statusText);
        }
    }).then(function (data) {

        $("#buttons").empty();

        console.log("completed: " + data.length);
        parsed = JSON.parse(data);
        var keys = _.keys(parsed)
        let count = keys.length - 1;
        let commented = 0;
        let unique = {};

        _.each(_.keys(parsed), function (i) {
            var cat = parsed[i];
            var button = $("<button/>");
            button.text(i);
            button.attr("class", 'tablinks');
            button.click(function (event) {
                onComplete(event, cat);
            });
            button.appendTo($("#feeds"));

            _.each(cat, function (i) {
                unique[i.url] = i;
            });
        });

        _.each(unique, function (i) {
            if (i.hasComments) {
                commented++;
            }
        });

        $('#stats').text(_.keys(unique).length + " stories, " + commented + " with comments.");

        $("button").first().click();

        //onComplete(parsed[_.first(_.keys(parsed))]);
    }).errr;
});

function onComplete(event, stories) {

    $("#result").empty();

    var sorted = [];

    sorted = _.sortBy(stories, function (n) {
        return n.url;
    });

    var div = $("<div class='tabcontent'></div>");
    $('#result').append(div);

    let n = 0;
    _.each(sorted, function (item) {
        if (n++ == 0 ) {
            var title = $('<p class="title">(' + item.title + ')</p>'); 
            div.append(title);
        } else {
            var title = $('<p class="title">' + item.title + '</p>'); 
            div.append(title);
            
            var line = $('<a>' + item.url + '</a>');
            line.css("color", item.hasComments ? 'blue' : 'red')
            line.attr('href', item.url);
            div.append(line);
        }
    });

    // remove all buttons marked as active
    $(".active").removeClass("active");
    // mark button triggering event as active
    $(event.target).addClass("active");
}