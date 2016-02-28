var vis;
var airports;
var player;

$(function() {
    vis = new Visualiser(function() {
        airports = new Airports(function() {
            player = new Player(vis);
        });
    });
});
