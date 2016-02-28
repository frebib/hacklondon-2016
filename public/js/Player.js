function Player(vis) {
    this.$optionPanel = $("#options-panel-content");
    this.$detailsPanel = $("#details-panel-content");

    this.vis = vis;
    this.startAirport = "LGW";
    this.airportHistory = [];
    this.money = 1000;
    this.startDate = new Date();
    this.date = this.startDate;
    var secondLength = 1;
    this.date.setMonth(this.date.getMonth() + 1);
    this.countries = {};

    this.logicalTick = function() {
        this.showOptions();
    };


    this.timeTick = function() {
        this.date.setTime(this.date.getTime() + 1000);

        this.showDetails();
    };


    this.setupTicks = function() {
        var obj = this;

        setInterval(function() {
            obj.logicalTick();
        }, 500);

        setInterval(function() {
            obj.timeTick();
        }, secondLength);
    };

    this.setupTicks();

    this.carryOutOption = function(option) {
        this.visitedAirport(option.airport);
        this.money -= option.cost;
        this.date.setTime(this.date.getTime() + option.time * 60 * 60 * 1000);
    };

    this.getNextOptions = function(callback) {
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

    this.showOptions = function() {
        var obj = this;
        function callback(options) {
            // Set the option panel
            var all = $("<table></table>")
                .attr("class", "all-options");

            options.forEach(function(o) {
                var airport = airports.getLocatedAirportForCode(o.airport)[2];

                var container = $("<tr></tr>")
                    .attr("class", "option-container")
                    .append(
                        $("<td></td>")
                            .attr("class", "option-name")
                            .text(airport.name)
                    )
                    .append(
                        $("<td></td>")
                            .attr("class", "option-cost")
                            .text("£" + o.cost)
                    )
                    .append(
                        $("<td></td>")
                            .attr("class", "option-start")
                            .text("11:00:00 1/2/2012")
                    )
                    .append(
                        $("<td></td>")
                            .attr("class", "option-start")
                            .text("01:00:00 1/2/2012")
                    )
                    .append(
                        $("<td></td>").append(
                            $("<button></button>")
                                .attr("class", "option-buy")
                                .text("Buy")
                                .click(function() {
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

            // Draw the lines
            obj.vis.clearFlightPaths();
            for (var i = 0; i < options.length; i++) {
                obj.vis.showFlightPath(obj.currentAirport(), options[i].airport);
            }
        }

        this.getNextOptions(callback);
    };

    this.showDetails = function() {
        $(".details-current")
            .text(this.currentAirport());
        $(".details-money")
            .text("£" + this.money);
        $(".details-date")
            .text(formatDateForDisplay(this.date));
        $(".details-infected")
            .text(this.amountInfected());
    };

    this.refresh = function() {
        this.showDetails();
        this.showOptions();
    };

    this.currentAirport = function() {
        return this.airportHistory[this.airportHistory.length - 1];
    };

    this.amountInfected = function() {
        var total = 0;

        for (var key in this.countries) {
            if (this.countries.hasOwnProperty(key)) {
                total += this.countries[key];
            }
        }

        return total;
    };

    this.visitedAirport = function(code) {
        this.airportHistory.push(code);
        var airport = airports.getLocatedAirportForCode(code);
        this.countries[airport[2].iso] = airport[2].population;
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
