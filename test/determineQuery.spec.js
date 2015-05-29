var
  expect = require('chai').expect,
  lib = require('../lib');

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
