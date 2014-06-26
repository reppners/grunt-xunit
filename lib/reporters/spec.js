var path = require('path');

module.exports = function (grunt, results) {
    var indents = 1;

    function indent() {
        return Array(indents).join(' ');
    }

    grunt.log.debug(JSON.stringify(results));

    results.assemblies.assembly.forEach(function (assembly) {
        var failures = [];

        grunt.log.writeln(color('suite', '%s%s'), indent(), path.basename(assembly.$.name));
        indents++;

        assembly.collection.forEach(function (collection) {
            indents++;

            collection.test.forEach(function (test) {
                indents++;

                if (test.$.result === 'Pass') {
                    grunt.log.writeln(indent() + color('checkmark', symbols.ok) + color('pass', ' %s'), test.$.method);
                } else if (test.$.result === 'Fail') {
                    failures.push(test);
                    grunt.log.writeln(indent() + color('fail', '%d) %s'), failures.length, test.$.method);
                }

                indents--;
            });

            indents--;
        });

        grunt.log.writeln();

        grunt.log.writeln(indent() + color('bright pass',  symbols.ok) + color('green', ' %d passing'), assembly.$.passed);

        if (assembly.$.failed) {
            grunt.log.writeln(indent() + color('bright fail',  symbols.err) + color('fail', ' %d failing'), assembly.$.failed);

            indents++;
            failures.forEach(function (test, index) {
                grunt.log.debug(JSON.stringify(test));
                grunt.log.writeln(indent() + color('error title', ' %d) %s:\n') + indent() + color('error message', ' %s') + color('error stack', '\n' + indent() + '%s\n'),
                                index, test.$.method, test.failure[0].message.join(', ').split(/\r\n|\n|\r/).join(', '), test.failure[0]['stack-trace'].join('\n'));
            });
            indents--;
        }

        indents--;
    });

}

var colors = {
        'pass': 90,
        'fail': 31,
        'bright pass': 92,
        'bright fail': 91,
        'bright yellow': 93,
        'pending': 36,
        'suite': 0,
        'error title': 0,
        'error message': 31,
        'error stack': 90,
        'checkmark': 32,
        'fast': 90,
        'medium': 33,
        'slow': 31,
        'green': 32,
        'light': 90,
        'diff gutter': 90,
        'diff added': 42,
        'diff removed': 41
    },

    symbols = {
        ok: '✓',
        err: '✖',
        dot: '․'
    },

    color = function (type, str) {
        return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m';
    };
