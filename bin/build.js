// Generated by CoffeeScript 1.8.0
var init_errors, series;

series = require('../src/series');

init_errors = require('./errors');

module.exports = function(tugboat, groupnames, usecache) {
  return tugboat.init(function(errors) {
    var group, haderror, name, tasks, _fn, _i, _j, _len, _len1;
    if (errors != null) {
      return init_errors(errors);
    }
    console.log();
    if (Object.keys(tugboat._groups).length === 0) {
      console.error('  There are no groups defined in this directory'.magenta);
      console.error();
      process.exit(1);
    }
    if (groupnames.length === 0) {
      groupnames = Object.keys(tugboat._groups);
    }
    haderror = false;
    for (_i = 0, _len = groupnames.length; _i < _len; _i++) {
      name = groupnames[_i];
      if (tugboat._groups[name] == null) {
        console.error(("  The group '" + name + "' is not available in this directory").red);
        console.error();
        haderror = true;
      }
    }
    if (haderror) {
      process.exit(1);
    }
    tasks = [];
    _fn = function(name, group) {
      return tasks.push(function(cb) {
        var config, grouptasks, servicename, _fn1, _ref;
        grouptasks = [];
        console.log("  Building " + name.blue + "...");
        _ref = group.services;
        _fn1 = function(servicename, config) {
          var output;
          output = servicename.cyan;
          return grouptasks.push(function(cb) {
            var results, run;
            while (output.length < 32) {
              output += ' ';
            }
            process.stdout.write("    " + output + " ");
            if (config.build == null) {
              console.log('-'.magenta);
              return cb();
            }
            results = '';
            run = function(message) {
              results += message;
              return results += '\n';
            };
            return tugboat.build(group, servicename, usecache, run, function(err) {
              if (err != null) {
                console.error('failed'.red);
                console.error(err);
                if (results.length !== 0) {
                  console.error(results);
                }
                console.error();
                return cb();
              }
              console.log('done'.green);
              return cb();
            });
          });
        };
        for (servicename in _ref) {
          config = _ref[servicename];
          _fn1(servicename, config);
        }
        return series(grouptasks, function() {
          console.log();
          return cb();
        });
      });
    };
    for (_j = 0, _len1 = groupnames.length; _j < _len1; _j++) {
      name = groupnames[_j];
      group = tugboat._groups[name];
      _fn(name, group);
    }
    return series(tasks, function() {});
  });
};
