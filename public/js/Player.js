function Player(vis) {
    this.$optionPanel = $("#options-panel-content");
    this.$detailsPanel = $("#details-panel-content");

    this.vis = vis;
    this.startAirport = "LGW";
    this.airportHistory = [this.startAirport];
    this.money = 1000;
    this.date = new Date();
    this.date.setMonth(this.date.getMonth() + 1);

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
            // Set the option panel
            var all = $("<div></div>")
                .attr("class", "all-options");

            options.forEach(function(o) {
                var container = $("<div></div>")
                    .attr("class", "option-container")
                    .append(
                        $("<div></div>")
                            .attr("class", "option-name")
                            .text(o.airport)
                    )
                    .append(
                        $("<div></div>")
                            .attr("class", "option-cost")
                            .text("£" + o.cost)
                    )
                    .append(
                        $("<div></div>")
                            .attr("class", "option-time")
                            .text(o.time + " hour" + (o.time == 1 ? "" : "s"))
                    )
                    .append(
                        $("<button></button>")
                            .attr("class", "option-buy")
                            .text("Buy")
                            .click(function() {
                                obj.carryOutOption(o);
                                obj.refresh();
                                obj.vis.panToAirport(o.airport);
                            })
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
        this.$detailsPanel.text("");

        this.$detailsPanel
            .append(
                $("<div></div>")
                    .attr("class", "details-current")
                    .text(this.currentAirport())
            )
            .append(
                $("<div></div>")
                    .attr("class", "details-money")
                    .text("£" + this.money)
            )
            .append(
                $("<div></div>")
                    .attr("class", "details-date")
                    .text(formatDateForDisplay(this.date))
            );
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
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
}
