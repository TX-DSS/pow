var http = require('http');
var express = require('express');
var Forkedspot = require('./models/forkedspot.js');

var app = express();

var credentials = require('./credentials.js');

var emailService = require('./lib/email.js')(credentials);


