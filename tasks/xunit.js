var path            = require('path'),
    child_process   = require('child_process'),
    _               = require('underscore');

module.exports = function (grunt) {
    grunt.registerMultiTask('xunit', 'Run xUnit tests.', function () {
        var options = this.options({
                cwd: '',
                runner: path.resolve(__dirname, '../vendor/xunit/xunit.console.clr4.exe')
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
