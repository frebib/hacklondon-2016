require('dotenv').config();
var connect = require('connect');
var api = require('./public/js/api');
var http = require('http');
var util = require('util');
var express = require('express');

var app = express();

// static content
app.use(express.static(__dirname + '/public'));

// api for testing
//app.get('/api/', function (req, res) {
//    api.getAirportConnections("LON", new Date(), function(json) {
//        console.log("RESPONSE: " + json);
//    });
//});


app.listen(8080);

