var
  assert = require('assert'),
  debug = require('debug'),
  _ = require('underscore'),
  log = debug('main'),
  flog = debug('filter'),
  rlog = debug('result');

var
  TEMPLATE_LENGTH = '2014-01-09T06:18:04.947113+00:00 heroku[router]: '.length,
  POST = 'POST',
  GET = 'GET',
  QUERY = {
    COUNT_PENDING_MESSAGES: 0,
    GET_FRIENDS_SCORE: 1,
    GET_MESSAGES: 2,
    GET_FRIENDS_PROGRESS: 3,
    USER_GET: 4,
    USER_POST: 5,
    OTHER: 6
  },
  EREGEX = {
    COUNT_PENDING_MESSAGES: /^\/api\/users\/\d+\/count_pending_messages$/,
    GET_FRIENDS_SCORE: /^\/api\/users\/\d+\/get_friends_score$/,
    GET_MESSAGES: /^\/api\/users\/\d+\/get_messages$/,
    GET_FRIENDS_PROGRESS: /^\/api\/users\/\d+\/get_friends_progress$/,
    USER: /^\/api\/users\/\d+$/
  };


module.exports = {
  QUERY: QUERY,
  determineQuery: function(path, method) {
    assert(path[0] === '/');
    var log = debug('determine');
    log(path, method);
    if (EREGEX.USER.test(path)) {
      log('in user branch');
      switch(method) {
        case GET:
          result = QUERY.USER_GET;
          break;
        case POST:
          result = QUERY.USER_POST;
          break;
        default:
          result = QUERY.OTHER;
      }
    } else if(method === GET) {
      log('in next branch');
      if (EREGEX.COUNT_PENDING_MESSAGES.test(path)) {
        result = QUERY.COUNT_PENDING_MESSAGES;
      } else if (EREGEX.GET_FRIENDS_SCORE.test(path)) {
        result = QUERY.GET_FRIENDS_SCORE;
      } else if (EREGEX.GET_MESSAGES.test(path)) {
        result = QUERY.GET_MESSAGES;
      } else if (EREGEX.GET_FRIENDS_PROGRESS.test(path)) {
        result = QUERY.GET_FRIENDS_PROGRESS;
      } else {
        result = QUERY.OTHER;
      }
    } else {
      result = QUERY.OTHER;
    }
    assert(result === QUERY.OTHER  || path[path.length - 1] !== '/', path);
    return result;
  },
  parseLine: function(line) {
    line = line.slice(TEMPLATE_LENGTH);
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
  },

  collectStats: function(acc, next) {
    var log = debug('collect');
    log(acc, next);
    var obj = acc[next.query] || {times: [], dynos: {}};
    log(acc, next, obj);
    acc[next.query] = obj;
    obj.times.push(next.connect + next.service);
    obj.dynos[next.dyno] = (obj.dynos[next.dyno] || 0);
    obj.dynos[next.dyno]++;
    log(acc, next);
    return acc;
  },

  proccessStats: function(stats) { 
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
  },

  prepareOutput: function(obj) {
    if(_.isUndefined(obj)) {
      return 'nobody call it\n';
    }
    return 'dyno: ' +  obj.dyno[0] + 'called ' + obj.dyno[1] + ' times\n';
  },
};
