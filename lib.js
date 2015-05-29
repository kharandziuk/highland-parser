var
  _ = require('underscore'),
  assert = require('assert'),
  debug = require('debug'),
  math = require('mathjs'),
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
  QUERY_PATH = [
  'GET /api/users/{user_id}/count_pending_messages',
  'GET /api/users/{user_id}/get_messages',
  'GET /api/users/{user_id}/get_friends_progress',
  'GET /api/users/{user_id}/get_friends_score',
  'GET /api/users/{user_id}',
  'POST /api/users/{user_id}'
  ],
  EREGEX = {
    COUNT_PENDING_MESSAGES: /^\/api\/users\/\d+\/count_pending_messages$/,
    GET_FRIENDS_SCORE: /^\/api\/users\/\d+\/get_friends_score$/,
    GET_MESSAGES: /^\/api\/users\/\d+\/get_messages$/,
    GET_FRIENDS_PROGRESS: /^\/api\/users\/\d+\/get_friends_progress$/,
    USER: /^\/api\/users\/\d+$/
  };

function getMode (arr) {
  return _(arr).chain().groupBy(_.identity).sortBy('length').last().value()[0];
}


var messageTemplate = _.template(
    "<%= path %>: calls=<%= calls %> mean=<%= mean %>" +
    " median=<%= median %> dyno=<%= dyno[0] %>(<%= dyno[1] %>)\n"
);


module.exports = {
  QUERY: QUERY,
  getMode: getMode,
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
    debug('parse')(line);
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
    debug('parse')(line, obj);
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
    if(_.isUndefined(stats)) {
      return;
    }
    var times = stats.times;
    return {
      dyno: _(stats.dynos).chain()
        .pairs()
        .sortBy(function(x) {return x[1];})
        .last()
        .value(),
      mean: math.mean(times),
      median: math.median(times),
      mode: getMode(times),
      calls: times.length,
    };
  },

  prepareOutput: function(x) {
    debug('prepare')(arguments);
    var obj = x[0], num =x[1];
    if(_.isUndefined(obj)) {
      return QUERY_PATH[num] + ' nobody call it\n';
    }
    return messageTemplate(
      _.extend(
        obj,
        {path: QUERY_PATH[num] }
      )
    );
  },
};
