require('dotenv').config();
var connect = require('connect');
var api = require('./public/js/api');
var http = require('http');
var request = require('request');
var url = require('url');
var util = require('util');
var express = require('express');

var app = express();

// static content
app.use(express.static(__dirname + '/public'));

// api
app.get('/api/', function (req, res) {
    var apiUrl = api.parseGetParams(req.query);
    if (!apiUrl) {
        res.status(404).send("{}");
        return;
    }

    // add api key (yuk)
    apiUrl += "?apiKey=" + process.env.API_KEY;

    console.log("Requesting: " + apiUrl);

    // request
    request(apiUrl, function (error, apiResponse, body) {
        res.sendStatus = apiResponse.statusCode;
        console.log("API response: " + apiResponse.statusCode);
        if (apiResponse.statusCode == 200)
            res.write(body);
        else
            res.write("API returned " + apiResponse.statusCode);

        res.end();
    });

});


app.listen(8080);

