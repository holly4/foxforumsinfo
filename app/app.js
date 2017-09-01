$(document).ready(function () {

    let parsed = {};

    console.log("requesting... ");

    $.ajax({
        url: "https://foxforumsinfo.herokuapp.com/stories",
        error: function (req, exception) {
            console.log(req.statusText);
        }
    }).then(function (data) {
        parsed = JSON.parse(data);
        var keys = _.keys(parsed)
        let count = keys.length - 1;
        let unique = {};
        let active = {};
        
        // add other buttons
        {
            _.each(_.keys(parsed), function (i) {
                let button = $("<button/>");
                button.text(i.replace(/_/g, ' '));
                button.attr("class", 'tablinks');
                button.click(function (event) {
                    onComplete(event, parsed[i]);
                });
                button.appendTo($("#feeds"));
                let commented = 0;

                _.each(parsed[i], function (i) {
                    unique[i.url] = i;
                    if (i.hasComments) {
                        commented++;
                        active[i.url] = i;
                    }
                });

                button.text(button.text() + " (" + commented + ")");
            });
        }

        // set up all Active feeds button
        {
            let button = $("#feeds button").first();
            button.attr("class", 'tablinks');
            button.text(button.text() + " (" + _.keys(active).length + ")");

            button.click(function (event) {
                onComplete(event, active);
            });            
        }        

        $('#stats').text(_.keys(unique).length + " stories, " + _.keys(active).length + " with comments");

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
    var dateline = "";

    _.each(sorted, function (item) {
        if (item.url.length) {
            var title = $('<p class="title">(' + item.title + ')</p>');
            div.append(title);

            var line = $('<a>' + item.url + '</a>');
            line.css("color", item.hasComments ? 'blue' : 'red')
            line.attr('href', item.url);
            line.attr('target', '_blank');
            div.append(line);            
        } else {
            dateline = $('<p class="date">(' + item.title + ')</p>');
        }
    });

    if (dateline.length) {
        div.append(dateline);
    }

    // remove all buttons marked as active
    $(".active").removeClass("active");
    // mark button triggering event as active
    $(event.target).addClass("active");
}