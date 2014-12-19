// Generated by CoffeeScript 1.8.0
var init_errors, series;

series = require('../src/series');

init_errors = require('./errors');

module.exports = function(tugboat, groupname, servicenames) {
  return tugboat.init(function(errors) {
    if (errors != null) {
      return init_errors(errors);
    }
    console.log();
    if (Object.keys(tugboat._groups).length === 0) {
      console.error('  There are no groups defined in this directory'.red);
      console.error();
      process.exit(1);
    }
    return tugboat.ps(function(err, groups) {
      var g, groupstoprocess, tasks, _, _fn, _i, _len;
      if (err != null) {
        console.error();
        console.error('  docker is down'.red);
        console.error();
        process.exit(1);
      }
      groupstoprocess = [];
      if (groupname) {
        if (groups[groupname] == null) {
          console.error(("  The group '" + groupname + "' is not available in this directory").red);
          console.error();
          process.exit(1);
        }
        groupstoprocess.push(groups[groupname]);
      } else {
        for (_ in groups) {
          g = groups[_];
          groupstoprocess.push(g);
        }
      }
      tasks = [];
      _fn = function(g) {
        var c, haderror, name, outputname, s, service, servicestoprocess, _fn1, _j, _k, _l, _len1, _len2, _len3, _ref, _ref1;
        tasks.push(function(cb) {
          console.log("  Deleting " + g.name.blue + "...");
          console.log();
          return cb();
        });
        servicestoprocess = [];
        if (servicenames.length !== 0) {
          haderror = false;
          for (_j = 0, _len1 = servicenames.length; _j < _len1; _j++) {
            name = servicenames[_j];
            if (g.services[name] == null) {
              console.error(("  The service '" + name + "' is not available in the group '" + g.name + "'").red);
              haderror = true;
            } else {
              servicestoprocess.push(g.services[name]);
            }
          }
          if (haderror) {
            process.exit(1);
          }
        } else {
          _ref = g.services;
          for (_ in _ref) {
            service = _ref[_];
            servicestoprocess.push(service);
          }
        }
        servicestoprocess = servicestoprocess.filter(function(s) {
          return s.containers.filter(function(c) {
            return !c.inspect.State.Running;
          }).length !== 0;
        });
        if (servicestoprocess.length === 0) {
          tasks.push(function(cb) {
            console.log("  No stopped containers to remove".magenta);
            return cb();
          });
        }
        for (_k = 0, _len2 = servicestoprocess.length; _k < _len2; _k++) {
          s = servicestoprocess[_k];
          outputname = s.name;
          while (outputname.length < 26) {
            outputname += ' ';
          }
          _ref1 = s.containers;
          _fn1 = function(outputname, s, c) {
            return tasks.push(function(cb) {
              process.stdout.write("  " + outputname.blue + " deleting " + (c.container.Names[0].substr(1).cyan) + " ");
              return tugboat.ducke.container(c.container.Id).rm(function(err) {
                if (err != null) {
                  console.error('error'.red);
                  console.error(err);
                  console.error();
                } else {
                  console.log('deleted'.green);
                }
                return cb();
              });
            });
          };
          for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
            c = _ref1[_l];
            _fn1(outputname, s, c);
          }
        }
        return tasks.push(function(cb) {
          console.log();
          return cb();
        });
      };
      for (_i = 0, _len = groupstoprocess.length; _i < _len; _i++) {
        g = groupstoprocess[_i];
        _fn(g);
      }
      return series(tasks, function() {});
    });
  });
};
