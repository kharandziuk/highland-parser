var
  exec = require('child_process').exec,
  expect = require('chai').expect;

describe('As a user I run application from command line', function() {
  describe('the first argument is path to file', function() {
    it("prints the output of correct length", function(done){
      exec(
        'node app.js test/test.log', {cwd: process.cwd()},
        function (err, stdout, stderr) {
          if(err) {
            throw err;
          }
          expect(stdout.toString().split('\n').length).to.equal(7, stdout);
          done();
        }
      );
    });
  });
});
