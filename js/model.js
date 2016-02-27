function Player() {
    var $optionPanel = $("#option-panel");

    this.startAirport = "LGW";
    this.currentAirport = this.startAirport;
    this.money = 1000;
    this.date = Date.now();

    this.carryOutOption = function(option) {
        this.currentAirport = option.airport;
        this.money -= option.cost;
        this.date.setTime(this.date.getTime() + option.time * 60 * 60 * 1000);
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
                );

            all.append(container);
        });

        console.log($optionPanel);

        $optionPanel.append(all);
    }
}