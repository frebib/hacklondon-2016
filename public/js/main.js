var vis;
var airports;
var player;

function startGame() {
    vis = new Visualiser(function() {
        airports = new Airports(function() {
            player = new Player(vis);
        });
    });
}

console.log("eh");

$(function(){
    $("#start-button").click(function() {
        console.log("something");
        $("#start-message").hide();
        $("#sidebar").show();
        startGame();
    });
});
