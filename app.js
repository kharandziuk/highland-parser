var
  H = require('highland'),
  fs = require('fs'),
  assert = require('assert'),
  _ = require('underscore'),
  debug = require('debug'),
  lib = require('./lib');


/*
 * GET /api/users/{user_id}/count_pending_messages
 * GET /api/users/{user_id}/get_messages
 * GET /api/users/{user_id}/get_friends_progress
 * GET /api/users/{user_id}/get_friends_score
 * POST /api/users/{user_id}
 * GET /api/users/{user_id}
*/


var lineStream = fs.createReadStream('data-samples/sample.log');

//2014-01-09T06:18:04.947113+00:00 heroku[router]: at=info method=POST path=/version_api/files host=services.pocketplaylab.com fwd="81.152.126.250" dyno=web.13 connect=1ms service=35ms status=200 bytes=69

H(lineStream).split()
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
  .map(lib.prepareOutput)
  .pipe(process.stdout);
