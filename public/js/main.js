function Visualiser(onLoad) {
    this.onLoad = onLoad;
    var countryFill = "#b5b690";
    var countryBorder = "#46472b";
    var airportFill = "#46472b";
    var airportBorder = "#f1f1dc";

    var mousePosition = [];

    var $container = $("body");
    var $tooltip = $("#tooltip");

    var width = $container.width(),
        height = $container.height();
    var isMouseDown = false;
    var mouseDownLocation = {x: 0, y: 0};
    var globeRotation = {x: 670, y: 400};


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

    $container.on("mousemove", function(e) {
        mousePosition = [e.screenX, e.screenY];
        $tooltip.css("top", mousePosition[1] - 140);
        $tooltip.css("left", mousePosition[0] - 15);
    });

    var $svg = $container.find("svg");

    var circle = svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", 400)
        .attr("fill", "#66b3ff");

    $svg.on("mousemove", function(e) {
        if (!isMouseDown)
            return;

        globeRotation.x += (e.clientX - mouseDownLocation.x);
        globeRotation.y += (e.clientY - mouseDownLocation.y);

        mouseDownLocation.x = e.clientX;
        mouseDownLocation.y = e.clientY;

        handleRotation();
    });

    $svg.on("mousedown", function(e) {
        isMouseDown = true;
        mouseDownLocation.x = e.clientX;
        mouseDownLocation.y = e.clientY;

        e.preventDefault();
        return false;
    });

    $svg.on("mouseup", function(e) {
        isMouseDown = false;
        e.preventDefault();
        return false;
    });

    $svg.on("mousedrag", function(e) {
        e.preventDefault();
        return false;
    });

    function handleRotation() {
        if (globeRotation.y > 800) globeRotation.y = 800;
        if (globeRotation.y < 0)   globeRotation.y = 0;

        projection.rotate([scaleX(globeRotation.x), scaleY(globeRotation.y)]);
        svg.selectAll("path").attr("d", path);

        console.log(globeRotation);
    }

    load();

    function load() {
        d3.json("json/world-110m.json", function (error, world) {
            if (error) throw error;

            svg.append("path")
                .datum(topojson.feature(world, world.objects.countries))
                .attr("class", "land")
                .attr("d", path)
                .attr("fill", countryFill)
                .attr("stroke", countryBorder)
                .attr("stroke-width", "0.1px");

            loadAirports();
            onLoad();
        });
    }

    function loadAirports() {
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

        airports.locatedAirports.forEach(function (a) {
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

    this.load = function () {
        loadJson();
    };

    this.showFlightPath = function (a1, a2) {
        var ao1 = airports.getLocatedAirportForCode(a1);
        var ao2 = airports.getLocatedAirportForCode(a2);

        registerFlightPath([ao1, ao2]);
    };

    this.clearFlightPaths = function() {
        svg.selectAll(".flight-path").remove();
    };

    this.panToAirport = function(code) {
        var airport = airports.getLocatedAirportForCode(code);
        console.log(projection.rotate());
        var desired = [-airport[0], -airport[1]];

        var interval = setInterval(function() {
            var current = projection.rotate();
            if (Math.abs(current[0] - desired[0]) < 0.1 && Math.abs(current[1] - desired[1]) < 0.1) {
                projection.rotate(desired);
                clearInterval(interval);
            } else {
                projection.rotate([(desired[0] + current[0]) / 2, (desired[1] + current[1]) / 2]);
            }

            svg.selectAll("path").attr("d", path);
        }, 8);
    };
}

var vis;
var airports;
var player;

$(window).load(function() {
    airports = new Airports(function() {
        vis = new Visualiser(function() {
            player = new Player(vis);
        });
    });
});
