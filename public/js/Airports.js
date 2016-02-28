function Airports(onLoad) {
    this.onLoad = onLoad;
    this.filteredAirports = [];
    this.allAirports = [];

    this.load = function() {
        var obj = this;
        d3.json("json/airports.json", function (error, rawAirports) {
            if (error) throw error;

            obj.allAirports = rawAirports;

            obj.filteredAirports = obj.allAirports.filter(function(cur) {
                return cur.size == "large" && cur.status == 1 && cur.type == "airport" && cur.name;
            });

            obj.onLoad();
        });
    };

    this.getLocatedAirportForCode = function(code) {
        // soz
        //this.filteredAirports = parseAirports(this.filteredAirports);

        var filtered = this.filteredAirports.filter(function(a) {
            return a.iso == code || a.iata == code;
        });

        if (filtered.length != 0) {
            return this.toTopojson(filtered[0]);
        } else {
            filtered = this.allAirports.filter(function(a) {
                return a.iso == code || a.iata == code;
            });

            if (filtered.length != 0) {
                var newAirport = filtered[0];

                this.filteredAirports.push(newAirport);
                vis.addAirport(this.toTopojson(newAirport));
                return this.toTopojson(newAirport);
            } else {
                return undefined;
            }
        }
    };

    this.toTopojson = function(a) {
        return [parseFloat(a.lon), parseFloat(a.lat), a];
    }

    this.load();
}