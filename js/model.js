function Player() {
    this.startAirport = "LGW";
    this.currentAirport = this.startAirport;
    this.money = 1000;
    this.date = Date.now();

    this.carryOutOption = function(option) {
        this.currentAirport = option.airport;
        this.money -= option.cost;
        this.date.setTime(this.date.getTime() + option.time * 60 * 60 * 1000);
    };

    function getNextOptions() {
        // Return API call for next airports
        return [{
            airport: "CHN",
            cost: 126,
            time: 1 // in hours
        }];
    }
}