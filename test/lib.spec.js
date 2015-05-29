var
  _ = require('underscore'),
  expect = require('chai').expect,
  lib = require('../lib');

describe('mode', function() {
  it('set', function() {
    expect(
      lib.getMode([1, 2, 2, 3])
    ).to.equal(2);
  });
});

describe('collectStats', function() {
  it('diffent queries', function() {
    var actual = _([
      { query: 0, connect: 10, service: 15, dyno: 'kapa'},
      { query: 1, connect: 10, service: 15, dyno: 'kapa'}
    ]).reduce(lib.collectStats, []);
    expect(actual).to.deep.equal([
      { times: [25], dynos: {kapa: 1}},
      { times: [25], dynos: {kapa: 1}}
    ]);
  });

  it('same query few times', function() {
    var actual = _([
      { query: 0, connect: 10, service: 15, dyno: 'kapa'},
      { query: 0, connect: 10, service: 0, dyno: 'kapa'}
    ]).reduce(lib.collectStats, []);
    expect(
      [ { times: [25, 10], dynos: {kapa: 2}} ]
    ).to.deep.equal(
      [ { times: [25, 10], dynos: {kapa: 2}} ]
    );
  });
});

describe('determineQuery', function() {
  describe('can determine query', function(){
    it('OTHER', function(){
      actual = lib.determineQuery('/version_api/files', 'POST');
      expect(actual).to.equal(lib.QUERY.OTHER);
    });

    it('GET_FRIENDS_SCORE', function(){
      actual = lib.determineQuery('/api/users/100002979150431/get_friends_score', 'GET');
      expect(actual).to.equal(lib.QUERY.GET_FRIENDS_SCORE);
    });

    it('GET_FRIENDS_PROGRESS', function(){
      actual = lib.determineQuery('/api/users/100002979150431/get_friends_progress', 'GET');
      expect(actual).to.equal(lib.QUERY.GET_FRIENDS_PROGRESS);
    });

    it('GET_MESSAGES', function(){
      actual = lib.determineQuery('/api/users/100002979150431/get_messages', 'GET');
      expect(actual).to.equal(lib.QUERY.GET_MESSAGES);
    });

    it('USER_GET', function(){
      actual = lib.determineQuery('/api/users/100000407228250', 'GET');
      expect(actual).to.equal(lib.QUERY.USER_GET);
    });

    it('USER_POST', function(){
      actual = lib.determineQuery('/api/users/100000407228250', 'POST');
      expect(actual).to.equal(lib.QUERY.USER_POST);
    });

    it('COUNT_PENDING_MESSAGES', function(){
      actual = lib.determineQuery('/api/users/100000407228250/count_pending_messages', 'GET');
      expect(actual).to.equal(lib.QUERY.COUNT_PENDING_MESSAGES);
    });
  });
});
