function Player() {
    var $optionPanel = $("#option-panel");
    var $detailsPanel = $("#details-panel");

    this.startAirport = "LGW";
    this.currentAirport = this.startAirport;
    this.money = 1000;
    this.date = new Date();

    this.carryOutOption = function(option) {
        this.currentAirport = option.airport;
        this.money -= option.cost;
        this.date.setTime(this.date.getTime() + option.time * 60 * 60 * 1000);

        console.log(this);
    };

    this.getNextOptions = function() {
        // Return API call for next airports
        return [{
            airport: "CHN",
            cost: 126,
            time: 2 // in hours
        },
        {
            airport: "CHN",
            cost: 126,
            time: 2 // in hours
        }];
    };

    this.showOptions = function() {
        var options = this.getNextOptions();
        var all = $("<div></div>")
            .attr("class", "all-options");

        var obj = this;
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
                        .attr("class", "option-name")
                        .text(o.time + " hour" + (o.time == 1 ? "" : "s"))
                )
                .append(
                    $("<button></button>")
                        .attr("class", "option-buy")
                        .text("Buy")
                        .click(function() {
                            obj.carryOutOption(o);
                            obj.refresh();
                        })
                );

            all.append(container);
        });

        console.log($optionPanel);

        $optionPanel.text("");
        $optionPanel.append(all);
    };

    this.showDetails = function() {
        $detailsPanel.text("");

        $detailsPanel
            .append(
                $("<div></div>")
                    .attr("class", "details-current")
                    .text(this.currentAirport)
            )
            .append(
                $("<div></div>")
                    .attr("class", "details-money")
                    .text("£" + this.money)
            )
            .append(
                $("<div></div>")
                    .attr("class", "details-date")
                    .text(this.date)
            );

        console.log("show details");
    };

    this.refresh = function() {
        this.showDetails();
        this.showOptions();
    };

    this.refresh();
}