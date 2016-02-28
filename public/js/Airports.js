function Airports(onLoad) {
    this.onLoad = onLoad;
    this.filteredAirports = [];
    this.allAirports = [];
    this.countries = {};

    this.load = function() {
        var obj = this;

        d3.json("json/countries.json", function(error, countries) {
            if (error) throw error;

            obj.countries = countries.countries.country;

            d3.json("json/airports.json", function (error, rawAirports) {
                if (error) throw error;

                obj.allAirports = rawAirports;

                obj.filteredAirports = obj.allAirports.filter(function(cur) {
                    if (cur.size == "large" && cur.status == 1 && cur.type == "airport" && cur.name) {
                        obj.registerAirport(cur);
                    }
                });

                obj.onLoad();
            });
        });
    };

    this.getLocatedAirportForCode = function(code) {
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
                this.registerAirport(newAirport);
                return this.toTopojson(newAirport);
            } else {
                return undefined;
            }
        }
    };

    this.toTopojson = function(a) {
        return [parseFloat(a.lon), parseFloat(a.lat), a];
    };

    this.registerAirport = function(airport) {
        this.filteredAirports.push(airport);
        vis.addAirport(this.toTopojson(airport));

        for (var i = 0; i < this.countries.length; i++) {
            if (this.countries[i].countryCode == airport.iso) {
                airport.population = parseInt(this.countries[i].population);
                airport.country = this.countries[i].countryName;
            }
        }
    };

    this.load();
}