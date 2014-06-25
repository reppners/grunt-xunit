# grunt-xunit [![Build Status](https://travis-ci.org/jgillich/grunt-xunit.svg?branch=master)](https://travis-ci.org/jgillich/grunt-xunit)

Run xUnit tests using Grunt.

##  Getting Started

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```
npm install grunt-xunit --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```
grunt.loadNpmTasks('grunt-xunit');
```

## xunit task
_Run this task with the `grunt xunit` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

### Example configuration

```
grunt.initConfig({
    xunit: {
        tests: {
            src: ['Tests/bin/Debug/Tests.dll']
        },
        options: {
            silent: true
        }
    }
});
```

grunt-xunit comes with its own xunit console runner binary, which is the .NET 4 64 bit variant. To override this behaviour, set the `runner` option to the executeable path.

This task has been tested on Linux and Windows, but it should work on other operating systems where `mono` points to the mono executeable.
