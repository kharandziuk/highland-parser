var
  H = require('highland'),
  fs = require('fs'),
  assert = require('assert'),
  _ = require('underscore'),
  debug = require('debug'),
  lib = require('./lib'),
  filePath = process.argv[2];

var lineStream = fs.createReadStream(filePath);
H(lineStream).errors(function(err){
    if(err.code == 'ENOENT') {
      process.stderr.write('No such file ' + err.path);
    } else {
    throw err;
    }
  }).split()
  .map(lib.parseLine)
  .map(function(obj) {
    obj.query = lib.determineQuery(obj.path, obj.method);
    return obj;
  })
  .filter(function(x) {
    return x.query !== lib.QUERY.OTHER;
  })
  .reduce([], lib.collectStats)
  .flatten()
  .map(lib.proccessStats)
  .zip(_.range(6))
  .map(lib.prepareOutput)
  .pipe(process.stdout);
