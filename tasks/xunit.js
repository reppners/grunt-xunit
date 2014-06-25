/*
xUnit.net console test runner (64-bit .NET 4.0.30319.18444)
Copyright (C) 2013 Outercurve Foundation.

usage: xunit.console.clr4 <xunitProjectFile> [options]
usage: xunit.console.clr4 <assemblyFile> [configFile] [options]

Valid options:
  /silent                : do not output running test count
  /teamcity              : forces TeamCity mode (normally auto-detected)
  /wait                  : wait for input after completion
  /trait "name=value"    : only run tests with matching name/value traits
                         : if specified more than once, acts as an OR operation
  /-trait "name=value"   : do not run tests with matching name/value traits
                         : if specified more than once, acts as an AND operation


Valid options for assemblies only:
  /noshadow              : do not shadow copy assemblies
  /xml <filename>        : output results to Xunit-style XML file
  /html <filename>       : output results to HTML file
  /nunit <filename>      : output results to NUnit-style XML file
*/

var path            = require('path'),
    child_process   = require('child_process'),
    _               = require('underscore');

module.exports = function (grunt) {
    grunt.registerMultiTask('xunit', 'Run xUnit tests.', function () {
        var options = this.options({
                cwd: '',
                runner: path.resolve(__dirname, '../xunit/xunit.console.clr4.exe')
            }),
            done = this.async(),
            xunitOptions =
                _.chain(options)
                .pick(['silent', 'teamcity', 'wait', 'trait', '-trait', 'noshadow', 'xml', 'html', 'nunit'])
                .map(function (value, key) {
                    if (typeof value === 'string') {
                        return '/' + key + ' ' + value;
                    } else if (value) {
                        return '/' + key;
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


        this.files.forEach(function (file) {
            grunt.log.debug('Processing file ' + file.src);
            grunt.file.expand({
                cwd: options.cwd,
                filter: 'isFile'
            }, file.src).forEach(function (file) {

                var command = [path.resolve(options.runner), path.resolve(file), xunitOptions],
                    child;

                if (process.platform !== 'win32') {
                    command.unshift('mono');
                }

                grunt.log.debug('Running command: ' + command);
                child = child_process.exec(command.join(' '), function (error, stdout, stderr) {
                    if (error) {
                        grunt.fail.warn('One or more tests failed');
                   }
                });

                child.stdout.on('data', function (chunk) {
                    grunt.log.write(chunk.toString('utf8'));
                });

                child.stderr.on('data', function (chunk) {
                    grunt.log.error(chunk.toString('utf8'));
                });

            });
        });

    });
};
