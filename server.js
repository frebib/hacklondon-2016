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
//    api.getAirportConnections("LON", new Date(2016, 03, 20, 15, 00, 00, 00), function (connections) {
//        for (var i = 0; i < connections.length; i++)
//            console.log(JSON.stringify(connections[i]));
//    });
//});


app.listen(8080);

