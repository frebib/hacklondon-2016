var vis;
var airports;
var player;

$(function() {
    airports = new Airports(function() {
        vis = new Visualiser(function() {
            player = new Player(vis);
        });
    });
});
