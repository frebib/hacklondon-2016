function Airports(onLoad) {
    this.onLoad = onLoad;
    this.filteredAirports = [];
    this.allAirports = [];

    this.load = function() {
        var obj = this;
        d3.json("json/airports.json", function (error, rawAirports) {
            if (error) throw error;

            obj.allAirports = parseAirports(rawAirports);

            obj.filteredAirports = obj.allAirports.filter(function(cur) {
                cur = cur[2];
                return cur.size == "large" && cur.status == 1 && cur.type == "airport" && cur.name;
            });

            obj.onLoad();
        });
    };

    function parseAirports(airports) {
        var parsed = [];

        for (var i = 0; i < airports.length; i++) {
            var cur = airports[i];

            if (!cur.lat || !cur.lon) {
                continue;
            }

            var item = [parseFloat(cur.lon), parseFloat(cur.lat), cur];

            parsed.push(item);
        }

        return parsed;
    }

    this.getLocatedAirportForCode = function(code) {
        // soz
        this.filteredAirports = parseAirports(this.filteredAirports);

        var filtered = this.filteredAirports.filter(function(a) {
            return a[2].iso == code || a[2].iata == code;
        });

        if (filtered.length != 0) {
            return filtered[0];
        } else {
            filtered = this.allAirports.filter(function(a) {
                return a[2].iso == code || a[2].iata == code;
            });

            if (filtered.length != 0) {
                this.filteredAirports.push(filtered[0]);
                return filtered[0];
            } else {
                return undefined;
            }
        }
    };

    this.load();
}