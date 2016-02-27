function Airports(onLoad) {
    this.onLoad = onLoad;
    this.airports = [];
    this.locatedAirports = [];

    this.load = function() {
        var obj = this;
        d3.json("json/airports.json", function (error, rawAirports) {
            if (error) throw error;

            obj.airports = rawAirports;
            obj.locatedAirports = parseAirports(obj.airports);

            obj.onLoad();
        });
    };

    function parseAirports(airports) {
        var parsed = [];

        for (var i = 0; i < airports.length; i++) {
            var cur = airports[i];

            if (!cur.lat || !cur.lon || cur.size != "large" || cur.status == 0 || cur.type != "airport") {
                continue;
            }

            var item = [parseFloat(cur.lon), parseFloat(cur.lat), cur];

            parsed.push(item);
        }

        return parsed;
    }

    this.getAirportForCode = function(code) {
        return this.getLocatedAirportForCode(code)[2];
    };

    this.getLocatedAirportForCode = function(code) {
        // soz
        this.locatedAirports = parseAirports(this.airports);

        for (var i = 0; i < this.locatedAirports.length; i++) {
            var cur = this.locatedAirports[i][2];
            if (cur.iso == code || cur.iata == code) {
                console.log(parseFloat(cur.lon) == this.locatedAirports[i][0]);

                return this.locatedAirports[i];
            }
        }

        return undefined;
    };

    this.load();
}