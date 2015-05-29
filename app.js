var
  H = require('highland'),
  fs = require('fs'),
  assert = require('assert'),
  _ = require('underscore'),
  debug = require('debug'),
  log = debug('main'),
  flog = debug('filter'),
  rlog = debug('result');
/*
 * GET /api/users/{user_id}/count_pending_messages
 * GET /api/users/{user_id}/get_messages
 * GET /api/users/{user_id}/get_friends_progress
 * GET /api/users/{user_id}/get_friends_score
 * POST /api/users/{user_id}
 * GET /api/users/{user_id}
*/
var POST = 'POST',
    GET = 'GET';

var QUERY = {
  COUNT_PENDING_MESSAGES: 0,
  GET_FRIENDS_SCORE: 1,
  GET_MESSAGES: 2,
  GET_FRIENDS_PROGRESS: 3,
  USER_GET: 4,
  USER_POST: 5,
  OTHER: 6
};

var EREGEX = {
  COUNT_PENDING_MESSAGES: /^\/api\/users\/\d+\/count_pending_messages$/,
  GET_FRIENDS_SCORE: /^\/api\/users\/\d+\/get_friends_score$/,
  GET_MESSAGES: /^\/api\/users\/\d+\/get_messages$/,
  GET_FRIENDS_PROGRESS: /^\/api\/users\/\d+\/get_friends_progress$/,
  USER: /^\/api\/users\/\d+$/
};

var determineQuery = function(path, method) {
  log(path, method);
  if (EREGEX.USER.test(path)) {
    switch(method) {
      case GET:
        return QUERY.USER_GET;
      case POST:
        return QUERY.USER_POST;
      default:
        return QUERY.OTHER;
    }
  } else if(method === GET) {
    if (EREGEX.COUNT_PENDING_MESSAGES.test(path)) {
      return QUERY.COUNT_PENDING_MESSAGES;
    } else if (EREGEX.GET_FRIENDS_SCORE.test(path)) {
      return QUERY.GET_FRIENDS_SCORE;
    } else if (EREGEX.GET_MESSAGES.test(path)) {
      return QUERY.GET_MESSAGES;
    } else if (EREGEX.GET_FRIENDS_PROGRESS.test(path)) {
      return QUERY.GET_MESSAGES;
    } else {
      return QUERY.OTHER;
    }
  } else {
    return QUERY.OTHER;
  }
};

var lineStream = fs.createReadStream('data-samples/sample.log');

//2014-01-09T06:18:04.947113+00:00 heroku[router]: at=info method=POST path=/version_api/files host=services.pocketplaylab.com fwd="81.152.126.250" dyno=web.13 connect=1ms service=35ms status=200 bytes=69
var templateLength = '2014-01-09T06:18:04.947113+00:00 heroku[router]: '.length;

var parseLine = function(line) {
  line = line.slice(templateLength);
  var obj = line.split(' ').reduce(
    function(obj, keyVal) {
      keyVal = keyVal.split('=');
      if (['dyno', 'connect', 'path', 'service', 'method'].indexOf(keyVal[0]) !== -1) {
        obj[keyVal[0]] = keyVal[1];
      }
      return obj;
    },
    {}
  );
  log(obj);
  assert(obj.connect.indexOf('ms') !== -1);
  assert(obj.service.indexOf('ms') !== -1);
  obj.connect = parseInt(obj.connect.slice(0, -2), 10);
  obj.service = parseInt(obj.service.slice(0, -2), 10);
  return obj;
};

var collectStats = function(acc, next) {
  var log = debug('collect');
  var obj = acc[next.query] || {time: 0,  count: 0, dynos: {}};
  log(acc, next, obj);
  acc[next.query] = obj;
  obj.time = next.connect + next.service;
  obj.count++;
  obj.dynos[next.dyno] = (obj.dynos[next.dyno] || 0);
  obj.dynos[next.dyno]++;
  log(acc, next);
  return acc;
};
var proccessStats = function(stats) { 
  debug('process')(stats);
  if(_.isUndefined(stats)) {
    return;
  }
  assert(_.has(stats, 'dynos'));
  var dyno = _(stats.dynos).chain().pairs().sortBy(function(x) {return x[1];}).value().slice(-1)[0];
  log('dyno', dyno);
  return {
    dyno: dyno
  };
};

var prepareOutput = function(obj) {
  if(_.isUndefined(obj)) {
    return 'nobody call it\n';
  }
  return 'dyno: ' +  obj.dyno[0] + 'called ' + obj.dyno[1] + ' times\n';
};

H(lineStream).split()
  .map(parseLine)
  .map(function(obj) {
    obj.query = determineQuery(obj.path, obj.method);
    return obj;
  })
  .filter(function(x) {
    flog('reject', x, QUERY.OTHER);
    return x.query !== QUERY.OTHER;
  })
  .reduce([], collectStats)
  .map(function(x) { debug('dopa')(x); return x;})
  .flatten()
  .map(function(x) { debug('kapa')(x); return x;})
  .map(proccessStats)
  .map(prepareOutput)
  .pipe(process.stdout);
