function Player(vis) {
    this.$optionPanel = $("#options-panel-content");
    this.$detailsPanel = $("#details-panel-content");

    this.vis = vis;
    this.startAirport = "KEF";
    this.airportHistory = [];
    this.money = 14300;
    this.startDate = new Date();
    this.date = new Date(this.startDate.getTime() + 1000 * 60 * 60 * 24 * 365 / 12); // Add 1 month
    this.nextFetch = 0;
    this.countries = {};
    this.lastTime = new Date();
    this.timeInterval = 0;
    this.flightData = [];

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

    this.getNextOptions = function (callback) {
        // Return API call for next airports
        $.getJSON({
            url: "/api",
            data: {
                que: "getConnections",
                from: this.currentAirport(),
                date: formatDateForAPI(this.date)
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

        if (this.date >= this.nextFetch) {
            this.nextFetch = new Date(this.date.getTime() + 1000 * 60 * 60 * 24 * 14);

            var callback = function(options) {
                obj.flightData = options.filter(function (o) {
                    return new Date(o.departureTime).getTime() > obj.date.getTime();
                }).sort(function (o1, o2) {
                    return new Date(o1.departureTime).getTime() - new Date(o2.departureTime).getTime();
                });
            };
            this.getNextOptions(callback);
        }

        //this.flightData.filter(function (o) {
        //    return new Date(o.departureTime).getTime() > obj.date.getTime();
        //});

        // Set the option panel
        var all = $("<ol>").attr("class", "all-options");

        this.flightData.slice(0, 10).forEach(function (o) {
            try {
                var dstAirport = airports.getLocatedAirportForCode(o.airport)[2];
                var srcAirport = airports.getLocatedAirportForCode(obj.currentAirport())[2];
            } catch(e) {
                return;
            }

            o.time = calculateTime(srcAirport, dstAirport);

            var container = $("<li>")
                .attr("class", "option-container")
                .append(
                    $("<div>")
                        .attr("class", "option-name")
                        .text(dstAirport.name + ", " + dstAirport.country)
                )
                .append(
                    $("<div>")
                        .attr("class", "option-cost")
                        .text("Cost: £" + o.cost)
                )
                .append(
                    $("<div>")
                        .attr("class", "option-start")
                        .text("Arrival: " + formatDateForDisplay(new Date(o.departureTime)))
                )
                .append(
                    $("<div>")
                        .attr("class", "option-time")
                        .text("Duration: " + formatTime(o.time.toFixed(0)))
                )
                .append(
                    $("<div>").append(
                        $("<button></button>")
                            .attr("class", "option-buy")
                            .text("Buy")
                            .click(function () {
                                obj.carryOutOption(o);
                                obj.timeTick();
                                obj.vis.panToAirport(o.airport);
                            })
                    )
                );

            all.append(container);
        });

        obj.$optionPanel.empty();
        obj.$optionPanel.append(all);

        if (this.flightData.length == 0 && obj.money > 0) {
            obj.$optionPanel
                .html("<div>Waiting for more flights...</div>");
            obj.$optionPanel
                .append(
                    $("<button>Go forward a day</button>")
                        .attr("class", "game-button")
                        .click(function() {
                            obj.date.setTime(obj.date.getTime() + 1000 * 60 * 60 * 24);
                        })
                )
                .append($("<br/>"))
                .append(
                    $("<button>Replay</button>")
                        .attr("class", "game-button")
                        .click(function() {
                            gameEnded(obj);
                        })
                )
        }

        // Draw the lines
        obj.vis.clearFlightPaths();
        for (var i = 0; i < this.flightData.length; i++) {
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

        for (var key in this.countries) {
            if (this.countries.hasOwnProperty(key)) {
                if (this.countries[key]) {
                    total += this.countries[key];
                }
            }
        }

        return total;
    };

    this.visitedAirport = function (code) {
        this.airportHistory.push(code);
        var airport = airports.getLocatedAirportForCode(code);
        this.countries[airport[2].iso] = airport[2].population;

        vis.countryInfected(airport[2].iso);
    };

    this.finish = function() {
        var obj = this;
        setTimeout(function() {
            gameEnded(obj);
            clearInterval(obj.logicInterval);
            clearInterval(obj.timeInterval);
        }, 1000);
    };

    this.visitedAirport(this.startAirport);
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

    return n.toFixed(3) + " " + exts[i];
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
