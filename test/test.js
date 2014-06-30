var assert          = require('assert'),
    child_process   = require('child_process');

describe('grunt-xunit', function () {
    this.timeout(10000);

    it('should pass passing tests', function (done) {
        child_process.exec('grunt xunit:passing', function (error, stdout, stderr) {
            assert.ifError(error);
            assert.equal(stderr, '');
            done();
        });
    });

    it('should fail failing tests', function (done) {
        child_process.exec('grunt xunit:failing', function (error, stdout, stderr) {
            assert.ok(error);
            done();
        });
    });
});
