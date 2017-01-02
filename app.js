'use strict';

// Attempt to load dev environment variables. Will only do so on environments
// where `NODE_ENV` is set to 'dev'. To add secrets to your development environment,
// copy `.env.example` to `.env` and add the required information.
require('./env');

// Retrieve constants we'll use throughout the app
const URL_BASE = process.env.URL_BASE; // base URL routes are mounted after
const AUTHY_KEY = process.env.AUTHY_KEY; // authy service API key\
const AUTHY_ID = process.env.AUTHY_ID; // ID for the authy user to challenge, hardcoded for now
const PHONE1 = process.env.PHONE1; // David's phone number ... env'd to keep it secret
const PHONE2 = process.env.PHONE2; // Kiigan's phone number ... env'd to keep it secret

// Check that necessary constants are defined. If any are undefined or empty
// strings, throw an error end exit 1.
if (!(URL_BASE && AUTHY_KEY && AUTHY_ID && PHONE1 && PHONE2) ||
    !(URL_BASE.length && AUTHY_KEY.length && AUTHY_ID.length && PHONE1.length && PHONE2)) {
  throw new Error('One or more required environment variables is not set. If you\'re running the app locally, copy `.env.example` to `.env` and add the required information.');
  process.exitCode = 1;
}

// Load dependencies
var twilio = require('twilio');
var express = require('express');
var bodyParser = require('body-parser');
var authy = require('authy')(AUTHY_KEY);

// Bootstrap express app
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 3000));

app.get('/', function(req, res) {
  res.send('Helllooooooo');
});

// When the call first comes in, give a phone tree
app.get('/david-kiigan/incoming', function (req, res) {
  var resp = new twilio.TwimlResponse();
  resp.gather({
    action: URL_BASE + '/david-kiigan/request',
    numDigits: 1
  }, function() {
    this.say('Hello. Press 1 for David Leonard. Press 2 for Keegan Snaer.',{
      voice: 'woman'
    })
  });
  res.send(resp.toString());
});

// When the user enters an option, route them
app.post('/david-kiigan/request', function(req, res) {
  var resp = new twilio.TwimlResponse();
  if (req.body.Digits == "1") {
    // Dial David
    resp.say('One moment please.', {voice:'woman'})
        .dial(PHONE1);
    res.send(resp.toString());
  }
  else if (req.body.Digits == "2") {
    // Dail Kiigan
    resp.say('One moment please.', {voice:'woman'})
        .dial(PHONE2);
    res.send(resp.toString());
  }
  else if (req.body.Digits == "9") {
    // Send to authy
    resp.gather({
      action: URL_BASE + '/david-kiigan/auth',
      finishOnKey: '*',
      timeout: '20'
    }, function() {
      this.say('Go for it.',{voice: 'man'});
    });
    res.send(resp.toString());
  }
  else {
    resp.gather({
      action: URL_BASE + '/david-kiigan/request',
      numDigits: 1
    }, function() {
      this.say('I don\'t know that number. Press 1 for David Leonard. Press 2 for Keegan Snaer.',{voice: 'woman'});
    });
    res.send(resp.toString());
  }
});

// Auth David with Authy
app.post('/david-kiigan/auth', function(req, res) {
  var resp = new twilio.TwimlResponse();
  var thisres = res;
  if (req.body.Digits && req.body.Digits !== "") {
    // They tried an auth
    // Verify auth with David's ID
    // Use the Digits as the key
    authy.verify(AUTHY_ID, req.body.Digits.replace('*',''), function (err, res) {
      // Auth worked
      console.log(err + '//');
      console.log(res);
      if (typeof(res) !== 'undefined') {
        if (typeof(res.success) == 'string' && res.success == 'true') {
          resp.say('Nice, you did it.', {voice:'woman'});
          thisres.send(resp.toString());
        }
      }
      // It didn't work, just hang up
      else {
        resp.hangup();
        thisres.send(resp.toString());
      }
    });
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
