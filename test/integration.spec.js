var
  exec = require('child_process').exec,
  expect = require('chai').expect;

describe('As a user I run application from command line', function() {
  describe('the first argument is path to file', function() {
    it("prints the output of correct length", function(done){
      exec(
        'node app.js data-samples/sample.log', {cwd: process.cwd()},
        function (err, stdout, stderr) {
          if(err) {
            throw err;
          }
          console.log(stdout.toString(), 'dfdg');
          expect(stdout.toString().split('\n').length).to.equal(7, stdout);
          done();
        }
      );
    });
  });
});
