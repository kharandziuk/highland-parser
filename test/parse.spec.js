var
  H = require('highland'),
  lib = require('../lib'),
  expect = require('chai').expect;

describe('parse function', function() {
  it("take stream of line and lib, returns stream of lines", function(done){
    var streamOfLines = H(['2014-01-09T06:16:53.748849+00:00 heroku[router]: at=info method=POST path=/api/online/platforms/facebook_canvas/users/100002266342173/add_ticket host=services.pocketplaylab.com fwd="94.66.255.106" dyno=web.12 connect=12ms service=21ms status=200 bytes=78',
        '2014-01-09T06:16:53.742892+00:00 heroku[router]: at=info method=GET path=/api/users/100002266342173/count_pending_messages host=services.pocketplaylab.com fwd="94.66.255.106" dyno=web.8 connect=9ms service=9ms status=304 bytes=0'
    ]);
    lib.parse(streamOfLines, lib).reduce("", H.add).each(function(res) {
      expect(res).to.equal(
'GET /api/users/{user_id}/count_pending_messages: calls=1 mean=18 median=18 dyno=web.8(1)\n' +
'GET /api/users/{user_id}/get_friends_score nobody call it\n' +
'GET /api/users/{user_id}/get_messages nobody call it\n' +
'GET /api/users/{user_id}/get_friends_progress nobody call it\n' +
'GET /api/users/{user_id} nobody call it\n' +
'POST /api/users/{user_id} nobody call it\n'
        );
      done();
    });
  });
});
