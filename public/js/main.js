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

function gameEnded(player) {
    $("#end-message").show();
    $("#globe").hide();
    $("#sidebar").hide();
    console.log("end");

    $("#end-infections").text(formatNumber(player.amountInfected()));
    $("#end-time").text(((player.date.getTime() - player.startDate.getTime()) / 1000 / 60 / 60 / 24).toFixed(2));
}

$(function(){
    $("#start-button").click(function() {
        $("#start-message").hide();
        $("#sidebar").show();
        startGame();
    });

    $("#replay-button").click(function() {
        location.reload();
    });
});
