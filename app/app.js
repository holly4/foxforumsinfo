const dataUrl = "https://foxforumsinfo.herokuapp.com/stories";
//const dataUrl = "http://localhost:8080/stories";

$(document).ready(function () {

    console.log("requesting... ");

    $.ajax({
        url: dataUrl,
        error: function (req, exception) {
            console.log(req.statusText);
        }
    }).then(function (jsonData) {
        let data = JSON.parse(jsonData);
        let keys = ["*All*"]
            .concat(_.keys(data));
        let count = keys.length - 1;
        let unique = {};
        let active = {};

        // find active stories
        _.each(keys, function (cat) {
            _.each(data[cat], function (item) {
                item.section = cat;
                if (item.hasComments) {
                    active[item.url] = item;
                }
            });
        });

        // add other buttons
        {
            _.each(keys, function (i) {
                let button = $("<button/>");
                button.attr("class", 'tablinks');
                let p = data[i];

                if (i === '*All*') {
                    p = active;
                }

                button.click(function (event) {
                    onComplete(event, p, i);
                });

                button.appendTo($("#feeds"));
                let commented = 0;

                _.each(p, function (i) {
                    unique[i.url] = i;
                    if (i.hasComments) {
                        commented++;
                    }
                });

                let text = i
                .replace(/_/g, ' ')
                .replace(/\*/g, '');
                button.text(text + " (" + commented + ")");
            });
        }

        $('#stats').text(_.keys(unique).length + " stories, " + _.keys(active).length + " with comments");

        $("#openinnewtab").click(function () {
            let openInNewTab = $("#openinnewtab").is(":checked");
            let elems = $("#result").find("a");
            if (openInNewTab) {
                elems.attr('target', '_blank');
            } else {
                elems.removeAttr('target');
            }
        });

        // set current view to first page
        $("button").first().click();
    });


});

function onComplete(event, stories, section) {
    let openInNewTab = $("#openinnewtab").is(":checked");
    $("#result").empty();

    let sorted = [];

    sorted = _.sortBy(stories, function (n) {
        return +moment(n.date);
    }).reverse();

    let div = $("<div class='tabcontent'></div>");
    $('#result').append(div);
    let dateline = "";

    _.each(sorted, function (item) {
        if (item.url.length) {
            let entry = $("<div class='entry'></div>");
            entry.appendTo(div);

            let then = moment(item.date);
            let tag = item.hasComments ? "✔️" : "❌";

            let title = $('<h3 class="title">'  + '</div>');
            title.appendTo(entry);

            let a = $('<a>' + " " + item.title + '</a>');
            a.css("color", item.hasComments ? 'blue' : 'red')
            a.attr('href', item.url);
            if (openInNewTab) {
                a.attr('target', '_blank');
            }
            a.appendTo(title);

            let section = item.section
                .replace(/_/g, ' ')
                .replace(/\*/g, '');
            let ago = then.fromNow().replace(/a day/, "1 day");
            let date = $('<div class="date">' + tag + " " + section + " - " + ago + '</div>');
            date.appendTo(entry);

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