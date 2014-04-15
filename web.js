"use strict";
var express = require('express')
   ,app = express()
   ,exec = require('child_process').exec
   ,compress = require('compression')
   ,bodyParser = require('body-parser');

app.use(compress());
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/html'));
app.use(bodyParser());

app.post('/fetchData', function(req, res) {
  var fetchCommand = "hxcount " + req.body.url + " | grep --invert / | awk '{$1=$1}1'";

  console.log('Attempting fetch from: ' + req.body.url);

  exec(fetchCommand, function(error, stdout) {
    if (error) {
      console.log('Error fetching data - ' + error.message);
      return res.end();
    }
    res.end(stdout.substr(0, stdout.length - 1));
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Node web server started');
});
