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
                // specify a runner path
                runner: path.join(__dirname, '../vendor/xunit/xunit.console.exe'),
                // specify a path to a xunit config file (xml or json)
                config: '',
                // specify a default xml result file for later parsing results in grunt
                xml: path.join(os.tmpdir(), _.uniqueId('xunit') + '.xml'),
                // flag for continuing on test failures useful for CI environments
                continueOnTestfailure: false
            }),

            // reporter implementation converting the result to grunt
            reporter = require(options.reporter || '../lib/reporters/spec');

            xunitOptions =
                _.chain(options)
                .pick([
                    // v2.1.0 runner options
                    'nologo',       //do not show the copyright message
                    'nocolor',      //do not output results with colors
                    'noappdomain',  //do not use app domains to run test code
                    'failskips',    //convert skipped tests into failures
                    'parallel',     //set parallelization based on option
                                    // none        - turn off all parallelization
                                    // collections - only parallelize collections
                                    // assemblies  - only parallelize assemblies
                                    // all         - parallelize assemblies & collections
                    'maxthreads',   // maximum thread count for collection parallelization
                                    // default   - run with default (1 thread per CPU thread)
                                    // unlimited - run with unbounded thread count
                                    // (number)  - limit task thread pool size to 'count'
                    'noshadow',     // do not shadow copy assemblies
                    'wait',         // wait for input after completion
                    'diagnostics',  // enable diagnostics messages for all test assemblies
                    'debug',        // launch the debugger to debug the tests
                    'serialize',    // serialize all test cases (for diagnostic purposes only)
                    'trait',        // "name=value"  : only run tests with matching name/value traits
                                    // if specified more than once, acts as an OR operation
                    'notrait',      // "name=value"  : do not run tests with matching name/value traits
                                    // if specified more than once, acts as an AND operation
                    'method',       // run a given test method (should be fully specified;
                                    // i.e., 'MyNamespace.MyClass.MyTestMethod')
                                    // if specified more than once, acts as an OR operation
                    'class',        // run all methods in a given test class (should be fully
                                    // specified; i.e., 'MyNamespace.MyClass')
                                    // if specified more than once, acts as an OR operation
                    'namespace',    // run all methods in a given namespace (i.e.,
                                    // 'MyNamespace.MySubNamespace')
                                    // if specified more than once, acts as an OR operation

                    // reporters    (optional, choose only one)
                    'appveyor',     // forces AppVeyor CI mode (normally auto-detected)
                    'quiet',        // do not show progress messages
                    'teamcity',     // forces TeamCity mode (normally auto-detected)
                    'verbose',      // show verbose progress messages

                    // result formats (optional, choose one or more)
                    'xml',          // output results to xUnit.net v2 style XML file
                    'xmlv1',        // output results to xUnit.net v1 style XML file
                    'nunit',        // output results to NUnit-style XML file
                    'html'          // output results to HTML file
                ])
                .map(function (value, key) {
                    if (typeof value === 'string') {
                        return '-' + key + ' ' + value;
                    } else if (value) {
                        return '-' + key;
                    } else {
                        return '';
                    }
                })
                .filter(function(value) {
                    return value;
                })
                .value()
                .join(' ');

        grunt.log.debug('runner path: ' + options.runner);

        if (!grunt.file.exists(options.runner)) {
            grunt.fail.warn('xUnit Binary not found. Please set the `bin` option to the path of the console runner executeable.');
        }


        async.series(this.files.map(function (file) {

            return function (callback) {

                // resolve config file path if defined
                var config;
                if(options.config) {
                    config = normalizeFilepath( options.config );
                }

                var src = normalizeFilepath(file.src);
                test(src, config, callback);
            };
        }), this.async());

        function normalizeFilepath(path) {
            return '"' + path.normalize( path ) + '"'
        }

        function test (file, config, callback) {
            var command = [
                    normalizeFilepath( options.runner ),
                    file
                ],
                child;

            if (process.platform !== 'win32') {
                command.unshift('mono');
            }

            if(config) {
                command.push( file )
            }
            command.push(xunitOptions);

            command = command.join(' ');

            grunt.log.debug('Running command: ' + command);

            child = child_process.exec(command);

            child.stdout.on('data', function (chunk) {
                grunt.log.debug(chunk.toString('utf8'));
            });

            child.stderr.on('data', function (chunk) {
                grunt.log.debug(chunk.toString('utf8'));
            });

            child.on('exit', function (code) {

                fs.readFile(options.xml, function (xmlReadError, xml) {

                    if(xmlReadError) {

                        if(options.continueOnTestfailure) {

                            grunt.log.writeln("expected xunit result xml at '" + options.xml + "' but failed to read it: " + xmlReadError);
                            callback();
                            return;
                        }

                        grunt.fail.warn('failed to read xunit result xml: ' + xmlReadError);
                    }

                    xml2js.parseString(xml, function (xmlParseError, result) {

                        if(xmlParseError) {
                            grunt.fail.warn('failed to parse xunit result xml: ' + xmlParseError);
                        }

                        reporter(grunt, result);

                        if(code && !options.continueOnTestfailure) {
                            grunt.fail.warn('xunit runner returned with code ' + code);
                        }

                        callback();
                    });
                });
            });

        }

    });
};
