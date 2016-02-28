function Player(vis) {
    this.$optionPanel = $("#options-panel-content");
    this.$detailsPanel = $("#details-panel-content");

    this.vis = vis;
    this.startAirport = "LGW";
    this.airportHistory = [this.startAirport];
    this.money = 1000;
    this.startDate = new Date();
    this.date = this.startDate;
    var secondLength = 10;
    this.date.setMonth(this.date.getMonth() + 1);

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
        this.airportHistory.push(option.airport);
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
            //console.log(
            //    options
            //        .map(function(o) { return airports.getLocatedAirportForCode(o); })
            //        .map(function(a) { return a.name; })
            //);

            // Set the option panel
            var all = $("<table></table>")
                .attr("class", "all-options");

            options.forEach(function(o) {
                var container = $("<tr></tr>")
                    .attr("class", "option-container")
                    .append(
                        $("<td></td>")
                            .attr("class", "option-name")
                            .text(o.airport)
                    )
                    .append(
                        $("<td></td>")
                            .attr("class", "option-cost")
                            .text("£" + o.cost)
                    )
                    .append(
                        $("<td></td>")
                            .attr("class", "option-time")
                            .text(o.time + " hour" + (o.time == 1 ? "" : "s"))
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
            .text(formatDateForDisplay(this.date))
    };

    this.refresh = function() {
        this.showDetails();
        this.showOptions();
    };

    this.currentAirport = function() {
        return this.airportHistory[this.airportHistory.length - 1];
    };

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
