function Player(vis) {
    this.$optionPanel = $("#options-panel-content");
    this.$detailsPanel = $("#details-panel-content");

    this.vis = vis;
    this.startAirport = "LGW";
    this.airportHistory = [this.startAirport];
    this.money = 14300;
    this.startDate = new Date();
    this.date = new Date(this.startDate.getTime() + 1000 * 60 * 60 * 24 * 365 / 12); // Add 1 month
    this.lastFetch = new Date();
    this.countries = {};
    this.lastTime = new Date();
    this.timeInterval = 0;
    this.flightData = [];
    this.requestCount = 0;

    this.timeTick = function () {
        var diff = new Date().getTime() - this.lastTime;
        this.date.setTime(this.date.getTime() + diff * 1000);
        this.lastTime = new Date().getTime();

        this.showDetails();
        this.showOptions();
    };


    this.setupTicks = function () {
        var obj = this;
        this.timeInterval = setInterval(function() {
            obj.timeTick();
        }, 10);
    };

    this.setupTicks();

    this.carryOutOption = function (option) {
        this.visitedAirport(option.airport);
        this.money -= option.cost;
        this.date.setTime(new Date(option.departureTime).getTime() + (option.time * 60 * 1000));

        if (this.money < 0) {
            this.finish();
        }
    };

    this.fetchNextFlights = function() {
        var obj = this;
        var od = obj.lastFetch;
        if (od.getMonth == 11)
            obj.lastFetch = new Date(od.getFullYear(), 0, 1);
        else
            obj.lastFetch = new Date(od.getFullYear(), od.getMonth() + 1, 1);

        var callback = function(options) {
            Array.prototype.push.apply(obj.flightData, options.filter(function (o) {
                o.elem = null;
                return new Date(o.departureTime).getTime() > obj.date.getTime();
            }).sort(function (o1, o2) {
                return new Date(o1.departureTime).getTime() - new Date(o2.departureTime).getTime();
            }));
        };
        obj.getNextOptions(obj.lastFetch, callback);
    };

    this.getNextOptions = function (date, callback) {
        // Return API call for next airports
        this.requestCount++;
        $.getJSON({
            url: "/api",
            data: {
                que: "getConnections",
                from: this.currentAirport(),
                date: formatDateForAPI(date)
            },
            success: callback
        });
    };

    function calculateTime(srcAirport, dstAirport) {

        // much thanks http://www.geodatasource.com/developers/javascript
        function distance(lat1, lon1, lat2, lon2, unit) {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit == "K") {
                dist = dist * 1.609344;
            }
            if (unit == "N") {
                dist = dist * 0.8684;
            }
            return dist;
        }

        var dist = distance(srcAirport.lat, srcAirport.lon, dstAirport.lat, dstAirport.lon, 'K');

        if (!dist)
            return 30; // default

        var planeSpeed = 893; // km/h
        return dist / planeSpeed * 60; // hours to minutes
    }

    this.showOptions = function () {
        var obj = this;

        // Set the option panel
        var all = $("ol.all-options");
        if (all.length < 1)
            all = $("<ol>", { class: "all-options" }).appendTo(obj.$optionPanel);

        var toRemove = [];
        for (var i in this.flightData) {
            if (all.length >= 10)
                break; // Enough elements in list

            var o = this.flightData[i];
            if (o.elem) {
                if (obj.date.getTime() > new Date(o.departureTime).getTime()) {
                    toRemove.push(o);
                    o.elem.remove();
                }
                continue;
            }

            try {
                var dstAirport = airports.getLocatedAirportForCode(o.airport)[2];
                var srcAirport = airports.getLocatedAirportForCode(obj.currentAirport())[2];
            } catch(e) {
                return;
            }

            o.time = calculateTime(srcAirport, dstAirport);
            o.elem = $("<li>")
                .attr("class", "option-container")
                .append(
                    $("<div>")
                        .attr("class", "option-name")
                        .html(dstAirport.name + ", " + dstAirport.country)
                )
                .append(
                    $("<div>")
                        .attr("class", "option-cost")
                        .html("Cost: <span class='option-value'>£" + o.cost + "</span>")
                )
                .append(
                    $("<div>")
                        .attr("class", "option-start")
                        .html("Arrival: <span class='option-value'>" + formatDateForDisplay(new Date(o.departureTime)) + "</span>")
                )
                .append(
                    $("<div>")
                        .attr("class", "option-time")
                        .html("Duration: <span class='option-value'>" + formatTime(o.time.toFixed(0)) + "</span>")
                )
                .append(
                    $("<div>").append(
                        $("<button>")
                            .attr("class", "option-buy")
                            .text("Buy")
                            .click(function () {
                                obj.carryOutOption(o);
                                obj.timeTick();
                                obj.vis.panToAirport(o.airport);
                            })
                    )
                ).appendTo(all);
        }

        for (var key in toRemove)
            if (obj.flightData.indexOf(key) != -1)
                obj.flightData.splice(key, 1);

        if (obj.flightData < 10 && obj.requestCount <= 6)
            this.fetchNextFlights();

        if (this.flightData.length == 0 && obj.money > 0) {
            obj.$optionPanel
                .html('<div id="waiting">Waiting for more flights...</div>');
            obj.$optionPanel
                .append(
                    $("<button>Go forward a day</button>")
                        .attr("class", "game-button")
                        .click(function() {
                            obj.date.setTime(obj.date.getTime() + 1000 * 60 * 60 * 24);
                        })
                )
                .append($('<br/>'))
                .append(
                    $('<button>Replay</button>')
                        .attr("class", "game-button")
                        .click(function() {
                            gameEnded(obj);
                        })
                )
        } else {
            $('div#waiting').remove();
        }

        // Draw the lines
        obj.vis.clearFlightPaths();
        for (i = 0; i < this.flightData.length; i++) {
            obj.vis.showFlightPath(obj.currentAirport(), this.flightData[i].airport);
        }
    };

    this.showDetails = function () {
        var airport = airports.getLocatedAirportForCode(this.currentAirport());

        $(".details-current")
            .text(airport[2].name);
        $(".details-money")
            .text("£" + this.money);
        $(".details-date")
            .text(formatDateForDisplay(this.date));
        $(".details-infected")
            .text("Infected: " + formatNumber(this.amountInfected()));
    };

    this.currentAirport = function () {
        return this.airportHistory[this.airportHistory.length - 1];
    };

    this.amountInfected = function () {
        var total = 0;

        for (var key in this.countries)
            if (this.countries.hasOwnProperty(key))
                if (this.countries[key])
                    total += this.countries[key];

        return total;
    };

    this.visitedAirport = function (code) {
        this.airportHistory.push(code);
        this.flightData = [];
        this.fetchNextFlights();
        var airport = airports.getLocatedAirportForCode(code);
        this.countries[airport[2].iso] = airport[2].population;

        vis.countryInfected(airport[2].iso);
    };

    this.finish = function() {
        var obj = this;
        setTimeout(function() {
            gameEnded(obj);
            clearInterval(obj.timeInterval);
        }, 1000);
    };

    this.timeTick();
    this.requestCount = 0;
    this.vis.panToAirport(this.currentAirport());
}

function formatDateForAPI(date) {
    return date.getFullYear() + "-"
        + ('0' + (date.getMonth() + 1)).slice(-2) + "-"
        + ('0' + date.getDate()).slice(-2);
}

function formatDateForDisplay(date) {
    var s = date.toString().split(" ");
    return s[4].slice(0, -3) + " - " + s[2] + " " + s[1] + " " + s[3];
}

function formatNumber(n) {
    var exts = ["", "thousand", "million", "billion"];
    var i = 0;
    while (n > 1000 && i < exts.length) {
        n /= 1000;
        i++;
    }

    if (i == 0) {
        return n;
    } else {
        return n.toFixed(3) + " " + exts[i];
    }
}

function formatTime(t) {
    if (t == 1) {
        return t + " minute";
    } else if (t < 60) {
        return t + " minutes";
    } else {
        var minutes = (t % 60);
        return parseInt(Math.floor(t / 60)) + "h" + (minutes == 0 ? "" : minutes + "m");
    }
}
