var path = require('path');

module.exports = function (grunt, results) {
    var indents = 0,
        n = 0;

    function indent() {
        return Array(indents).join(' ')
    }

    results.assemblies.assembly.forEach(function (assembly) {
        console.log(color('suite', '%s%s'), indent(), path.basename(assembly.$.name));
        indents++;
        assembly.collection.forEach(function (collection) {
            indents++;
            collection.test.forEach(function (test) {
                indents++;
                if(test.$.result === 'Pass') {
                    console.log(indent() + color('checkmark', ' ' + symbols.ok) + color('pass', ' %s'), test.$.method);
                } else {
                    console.log(indent() + color('fail', '  %d) %s'), ++n, test.$.method);
                }
                indents--;
            });
            indents--;
        });
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
