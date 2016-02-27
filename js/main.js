$(
function() {function Visualiser() {
    var countryFill = "#b5b690";
    var countryBorder = "#46472b";
    var airportFill = "#46472b";
    var airportBorder = "#f1f1dc";

    var mousePosition = [];

    var $container = $("body");
    var $tooltip = $("#tooltip");
    var airports = [];

    var width = $container.width(),
        height = $container.height();

    var projection = d3.geo.orthographic()
        .scale(400)
        .translate([width / 2, height / 2])
        .clipAngle(90);

    var path = d3.geo.path()
        .projection(projection);

    var scaleX = d3.scale.linear()
        .domain([0, width])
        .range([-180, 180]);

    var scaleY = d3.scale.linear()
        .domain([0, height])
        .range([90, -90]);

    var svg = d3.select("#globe").append("svg")
        .attr("width", width)
        .attr("height", height);

    console.log(svg);

    svg.on("mouseup", function () {
        var p = d3.mouse(this);
        projection.rotate([scaleX(p[0]), scaleY(p[1])]);
        svg.selectAll("path").attr("d", path);
    });

    $container.on("mousemove", function(e) {
        mousePosition = [e.screenX, e.screenY];
        $tooltip.css("top", mousePosition[1] - 140);
        $tooltip.css("left", mousePosition[0] - 15);
    });

    function loadJson() {
        var topojsonObject = {
            type: "Topology",
            objects: {
                events: {
                    type: "MultiPoint",
                    coordinates: []
                }
            },
            arcs: [],
            transform: {
                scale: [1, 1],
                translate: [0, 0]
            }
        };

        d3.json("json/world-110m.json", function (error, world) {
            if (error) throw error;

            svg.append("path")
                .datum(topojson.feature(world, world.objects.countries))
                .attr("class", "land")
                .attr("d", path)
                .attr("fill", countryFill)
                .attr("stroke", countryBorder)
                .attr("stroke-width", "0.1px");
        });

        d3.json("json/airports.json", function (error, rawAirports) {
            if (error) throw error;

            airports = parseAirports(rawAirports);

            airports.forEach(function (a) {
                topojsonObject.objects.events.coordinates = [a];
                svg.append("path")
                    .datum(topojson.feature(topojsonObject, topojsonObject.objects.events))
                    .attr("class", "points")
                    .attr("stroke", airportBorder)
                    .attr("fill", airportFill)
                    .attr("d", path.pointRadius(function (d) {
                        return 5;
                    }))
                    .on("mouseover", function (d) {
                        var name = getObjectFromTopojson(d).name;
                        $tooltip.text(name);
                        $tooltip.show();
                    })
                    .on("mouseout", function (d) {
                        $tooltip.fadeOut(250);
                    })
            });

            randomFlightPath();
        });
    }


    function randomFlightPath() {
        var airport = airports[parseInt(Math.random() * airports.length)];


        for (var i = 0; i < airports.length; i += 5) {
            registerFlightPath([airport, airports[i]]);
        }
    }

    function registerFlightPath(fp) {
        for (var i = 1; i < fp.length; i++) {
            fp[i][0] = fp[i][0] - fp[0][0];
            fp[i][1] = fp[i][1] - fp[0][1];
        }

        var test = {
            type: "Topology",
            objects: {
                flights: {
                    type: "GeometryCollection",
                    geometries: [
                        {type: "Polygon", arcs: [[0]]}
                    ]
                }
            },
            arcs: [
                fp
            ],
            transform: {
                scale: [1, 1],
                translate: [0, 0]
            }
        };

        svg.append("path")
            .datum(topojson.feature(test, test.objects.flights))
            .attr("class", "flight-path")
            .attr("d", path)
            .attr("stroke-width", "3px")
            .attr("stroke", "blue");
    }

    function getObjectFromTopojson(tj) {
        try {
            return tj.geometry.coordinates[0][2]
        } catch (e) {
            return undefined;
        }
    }

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

    function getAirportForCode(code) {
        for (var i = 0; i < airports.length; i++) {
            if (airports[i].iso == code) {
                return airports[i];
            }
        }

        return undefined;
    }

    this.load = function () {
        loadJson();
    };

    this.showFlightPath = function (a1, a2) {
        registerFlightPath(
            getAirportForCode(a1),
            getAirportForCode(a2)
        );
    }
}

var vis = new Visualiser();
vis.load();

var player = new Player();
});