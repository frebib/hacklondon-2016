$(function() {
    var width = 960,
        height = 500;

    var projection = d3.geo.orthographic()
        .scale(250)
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

            parseAirports(airports);

            svg.selectAll("circle")
                .data([aa,bb]).enter()
                .append("circle")
                .attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
                .attr("cy", function (d) { return projection(d)[1]; })
                .attr("r", "8px")
                .attr("fill", "red")
        });
    }

    function parseAirports(airports) {
        
    }
});