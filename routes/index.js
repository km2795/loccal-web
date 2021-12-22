const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const async = require('async');
const request = require('request');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'LOC Calculator' });
});

router.post('/loc', function (req, res, next) {
  if (!fs.existsSync('uploads/')) {
    fs.mkdirSync('uploads/');
  }

  let form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  form.uploadDir = 'uploads/';
  form.keepExtensions = true;
  form.maxFieldsSize = 20 * 1024 * 1024;

  let fileList = [];
  let data = {};

  form.on('file', function (name, file) {
    fs.renameSync(file.path, form.uploadDir + '/' + file.name);
    fileList.push(file.name);
  })
  .on('progress', function (bytesReceived, bytesExpected) {
  })
  .on('end', function () {
    async.each(fileList, function (file, callback) {
      data[file] = getLineCount(form.uploadDir + '/' + file);
      callback(null);
    }, function (err) {
    });
  });
  
  form.parse(req, function (err, fields, files) {
    sendLog({
      "channel": "xc9-loccal",
      "logDate": (new Date().getTime().toString()),
      "status": "up/running",
    }, function () {
      res.send({
        "status": true,
        "data": data
      });
    });
  });
});

function getLineCount(filePath) {
  var lineCount = 0;
  var NoComments = 0;
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  var lines = fs.readFileSync(filePath).toString().split("\n");
  lineCount = lines.length;

  // In case comments are not to be included.
  if (NoComments === 1) {
    for (let i = 0; i < lineCount; i++) {
      // For single line comments only.
      for (let j = 0; j < lines[i].length; j++) {
        if (lines[i][j] === '/') {
          if (((j + 1) < lines[i].length) && (lines[i][j + 1] === '/')) {
            console.log(lineCount);
            lineCount--;
          }
        }
      }
    }
  } else {
    if (lines[0] === '\n') { 
      lineCount--; 
    }

    if (lines[lines.length - 1] === '\n') { 
      linesCount--; 
    }
  }

  return lineCount;
}

function sendLog(info, callback) {
  sendQuery('http://localhost:7904/log/', info, 'POST', function (result) {
    callback({"status": true});
  });
}

/* Send out queries to the OpenWeatherMap server. */
function sendQuery(url, body, method, callback) {

  'use strict';
  var options = {
    uri: url,
    method: method,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  }

  request(options, function (err, response, body) {
    if (err) {
      callback(err);
    } else {
      callback(body);
    }
  });
}

module.exports = router;
