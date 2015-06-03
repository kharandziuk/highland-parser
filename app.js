var
  H = require('highland'),
  fs = require('fs'),
  assert = require('assert'),
  _ = require('underscore'),
  debug = require('debug'),
  lib = require('./lib'),
  filePath = process.argv[2];

var lineStream = H(fs.createReadStream(filePath))
  .errors(function(err){
    if(err.code == 'ENOENT') {
      process.stderr.write('No such file ' + err.path);
    } else {
      throw err;
    }
  }).split();

// change lib object if you customize a parser
lib.parse(lineStream, lib).pipe(process.stdout);



