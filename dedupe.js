#!/usr/bin/env node
var fs =     require('fs');
var crypto = require('crypto');
var path =   require('path');
var R =      require('ramda');

var argv = require('minimist')(process.argv.slice(2), {boolean: ['n']});
if (argv._.length !== 1) {
  console.error('Usage: ' + process.argv[1] + ' [-n] directory');
  console.error("  -n   Dry run. Don't delete any files, print what would be deleted");
  process.exit(1);
}

function checksum(data, algorithm, encoding) {
  return crypto
    .createHash(algorithm || 'md5')
    .update(data, 'utf8')
    .digest(encoding || 'hex');
}

var dir = argv._[0];
var dupes = {};
fs.readdirSync(dir).forEach(function(file) {
  var filename = path.join(dir, file);
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
    if (!argv.n) {
      fs.unlinkSync(filename);
    }
  });
});
