require('dotenv').config();
var connect = require('connect');
var api = require('./js/api');
var http = require('http');
var request = require('request');
var url = require('url');

var server = http.createServer(function (req, res) {
    var params = url.parse(req.url, true);
    var apiUrl = api.parseGetParams(params);

    // invalid params: serve site
    if (!apiUrl) {
        // todo
        console.log("serving static site");
        return;
    }

    // add api key (yuk)
    apiUrl += "?apiKey=" + process.env.API_KEY;

    console.log("Requesting: " + apiUrl);

    // request
    request(apiUrl, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("SUCCESS: " + body);
        }
        else {
            console.log("FAILURE (" + response.statusCode + ")");
        }

    });

});

server.listen(8080);
