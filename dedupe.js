#!/usr/bin/env node
var fs =     require('fs');
var crypto = require('crypto');
var path =   require('path');
var R =      require('ramda');

var dir = process.argv[2];
if (!dir) {
  console.error('Usage: ' + process.argv[1] + ' directory');
  process.exit();
}

function checksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || 'md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex');
}

var dupes = {};
var files = fs.readdirSync(dir);
files.forEach(function(f) {
  var filename = path.join(dir, f);
  var data = fs.readFileSync(filename);
  var hash = checksum(data);
  if (!dupes[hash]) {
    dupes[hash] = [];
  }
  dupes[hash].unshift(filename);
});

R.valuesIn(dupes).forEach(function(dupe) {
  var keep = dupe.shift();
  console.log('keep   ' + keep);
  dupe.forEach(function(filename) {
    console.log('remove ' + filename);
    fs.unlinkSync(filename);
  });
});
