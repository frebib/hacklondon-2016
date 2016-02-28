function Player(vis) {
    this.$optionPanel = $("#options-panel-content");
    this.$detailsPanel = $("#details-panel-content");

    this.vis = vis;
    this.startAirport = "KEF";
    this.airportHistory = [];
    this.money = 1200;
    this.startDate = new Date();
    this.date = new Date(this.startDate.getTime());
    var minuteLength = 1;
    this.date.setMonth(this.date.getMonth() + 1);
    this.countries = {};
    this.timeInterval = 0;
    this.logicInterval = 0;

    this.logicalTick = function () {
        this.showOptions();
    };


    this.timeTick = function () {
        this.date.setTime(this.date.getTime() + 1000);

        this.showDetails();
    };


    this.setupTicks = function () {
        var obj = this;

        this.timeInterval = setInterval(function () {
            obj.timeTick();
        }, minuteLength);

        this.logicInterval = setInterval(function () {
            obj.logicalTick();
        }, 500);
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

        function callback(options) {
            options = options.filter(function(o) {
                return new Date(o.departureTime).getTime() > obj.date.getTime();
            }).sort(function (o1, o2) {
                return new Date(o1.departureTime).getTime() - new Date(o2.departureTime).getTime();
            }).slice(0, 5);

            // Set the option panel
            var all = $("<table></table>")
                .attr("class", "all-options");


            options.forEach(function (o) {
                try {
                    var dstAirport = airports.getLocatedAirportForCode(o.airport)[2];
                    var srcAirport = airports.getLocatedAirportForCode(obj.currentAirport())[2];
                } catch(e) {
                    return;
                }

                o.time = calculateTime(srcAirport, dstAirport);

                var container = $("<tr></tr>")
                    .attr("class", "option-container")
                    .append(
                        $("<td></td>")
                            .attr("class", "option-name")
                            .text(dstAirport.name + ", " + dstAirport.country)
                    )
                    .append(
                        $("<td></td>")
                            .attr("class", "option-cost")
                            .text("£" + o.cost)
                    )
                    .append(
                        $("<td></td>")
                            .attr("class", "option-start")
                            .text(formatDateForDisplay(new Date(o.departureTime)))
                    )
                    .append(
                        $("<td></td>")
                            .attr("class", "option-time")
                            .text(o.time.toFixed(0) + " minutes")
                    )
                    .append(
                        $("<td></td>").append(
                            $("<button></button>")
                                .attr("class", "option-buy")
                                .text("Buy")
                                .click(function () {
                                    obj.carryOutOption(o);
                                    obj.refresh();
                                    obj.vis.panToAirport(o.airport);
                                })
                        )
                    );

                all.append(container);
            });

            obj.$optionPanel.text("");
            obj.$optionPanel.append(all);

            if (options.length == 0 && obj.money > 0) {
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
            for (var i = 0; i < options.length; i++) {
                obj.vis.showFlightPath(obj.currentAirport(), options[i].airport);
            }
        }

        this.getNextOptions(callback);
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

    this.refresh = function () {
        this.showDetails();
        this.showOptions();
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
    this.refresh();
    this.vis.panToAirport(this.currentAirport());
}

function formatDateForAPI(date) {
    return date.getFullYear() + "-"
        + ('0' + (date.getMonth() + 1)).slice(-2) + "-"
        + ('0' + date.getDate()).slice(-2);
}

function formatDateForDisplay(date) {
    var s = date.toString().split(" ");
    return s[4] + " - " + s[2] + " " + s[1] + " " + s[3];
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
