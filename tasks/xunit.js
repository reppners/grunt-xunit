var path            = require('path'),
    child_process   = require('child_process'),
    fs              = require('fs'),
    os              = require('os'),
    async           = require('async'),
    _               = require('underscore'),
    xml2js          = require('xml2js');

module.exports = function (grunt) {
    grunt.registerMultiTask('xunit', 'Run xUnit tests.', function () {
        var options = this.options({
                cwd: '',
                runner: path.resolve(__dirname, '../vendor/xunit/xunit.console.exe'),
                xml: path.join(os.tmpdir(), _.uniqueId('xunit') + '.xml')
            }),
            reporter = require(options.reporter || '../lib/reporters/spec'),
            xunitOptions =
                _.chain(options)
                .pick(['silent', 'teamcity', 'wait', 'trait', '-trait', 'noshadow', 'xml', 'html', 'nunit'])
                .map(function (value, key) {
                    if (typeof value === 'string') {
                        return '-' + key + ' ' + value;
                    } else if (value) {
                        return '-' + key;
                    } else {
                        return '';
                    }
                })
                .value()
                .join(' ');

        grunt.log.debug('runner path: ' + options.runner);

        if (!grunt.file.exists(options.runner)) {
            grunt.fail.warn('xUnit Binary not found. Please set the `bin` option to the path of the console runner executeable.');
        }


        async.series(this.files.map(function (file) {
            return function (callback) { test(file.src, callback); };
        }).concat([function (callback) {
            fs.unlink(options.xml, callback);
        }]), this.async());

        function test (file, callback) {
            var command = [path.resolve(options.runner + ''), path.resolve(file + ''), xunitOptions],
                child;

            if (process.platform !== 'win32') {
                command.unshift('mono');
            }

            grunt.log.debug('Running command: ' + command.join(' '));
            child = child_process.exec(command.join(' '));

            child.stdout.on('data', function (chunk) {
                grunt.log.debug(chunk.toString('utf8'));
            });

            child.stderr.on('data', function (chunk) {
                grunt.log.debug(chunk.toString('utf8'));
            });

            child.on('exit', function (code) {
                fs.readFile(options.xml, function (error, xml) {
                    if(error) {
                        grunt.fail.warn(error);
                    }

                    xml2js.parseString(xml, function (error, result) {
                        if(error) {
                            grunt.fail.warn(error);
                        }
                        reporter(grunt, result);

                        if(code) {
                            grunt.fail.warn('');
                        }

                        callback(null);
                    });
                });
            });

        }

    });
};
