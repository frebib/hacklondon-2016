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
