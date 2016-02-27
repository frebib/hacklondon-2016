$(function() {
    var $container = $("body");

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

    svg.on("mouseup", function() {
        var p = d3.mouse(this);
        projection.rotate([scaleX(p[0]), scaleY(p[1])]);
        svg.selectAll("path").attr("d", path);
    });

    loadJson();

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

        d3.json("json/world-50m.json", function(error, world) {
            if (error) throw error;

            svg.append("path")
                .datum(topojson.feature(world, world.objects.countries))
                .attr("class", "land")
                .attr("d", path)
                .attr("stroke", "red");
        });

        d3.json("json/airports.json", function(error, airports) {
            if (error) throw error;

            var parsed = parseAirports(airports);

            parsed.forEach(function(a) {
                topojsonObject.objects.events.coordinates = [a];
                svg.append("path")
                    .datum(topojson.feature(topojsonObject, topojsonObject.objects.events))
                    .attr("class", "points")
                    .attr("stroke", "white")
                    .attr("d", path.pointRadius(function(d) {
                        return 5;
                    }));
            });
        });
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
});