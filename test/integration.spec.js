var
  exec = require('child_process').exec;
  assert = require('assert');

describe('As a user I run application from command line', function() {
  describe('the first argument is path to file', function() {
    it("prints correct output", function(done){
      exec(
        'node app.js test/test.log', {cwd: process.cwd()},
        function (err, stdout, stderr) {
          if(err) {
            throw err;
          }
          console.log(stdout);
          assert(stdout.toString() === 'aaa'); 
          done();
        }
      );
    });
  });
});
