require('dotenv').config();
var connect = require('connect');
var api = require('./api');
var http = require('http');
var util = require('util');
var express = require('express');

var app = express();

// static content
app.use(express.static(__dirname + '/public'));

// api calls
app.get('/api/', function (req, res) {
    api.handleApiCall(req, res);
});

app.listen(8080);