// Generated by CoffeeScript 1.8.0
var init_errors, modem, seq;

seq = require('../src/seq');

init_errors = require('./errors');

modem = require('ducke-modem');

module.exports = function(tugboat, groupname, servicenames) {
  return tugboat.init(function(errors) {
    if (errors != null) {
      return init_errors(errors);
    }
    return tugboat.diff(function(err, groups) {
      var c, g, haderror, name, s, service, servicestoprocess, _, _i, _j, _len, _len1, _ref, _results;
      if (err != null) {
        console.error();
        console.error('  docker is down'.red);
        console.error();
        process.exit(1);
      }
      console.log();
      groupname = groupname.replace('.yml', '');
      if (groups[groupname] == null) {
        console.error(("  The group '" + groupname + "' is not available in this directory").red);
        console.error();
        process.exit(1);
      }
      g = groups[groupname];
      servicestoprocess = [];
      if (servicenames.length !== 0) {
        haderror = false;
        for (_i = 0, _len = servicenames.length; _i < _len; _i++) {
          name = servicenames[_i];
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
      servicenames = servicestoprocess.map(function(s) {
        return s.name;
      }).join(', ');
      console.log("  Listening to " + g.name.blue + " (" + servicenames + ")...");
      console.log();
      process.stdout.setMaxListeners(60);
      process.stderr.setMaxListeners(60);
      _results = [];
      for (_j = 0, _len1 = servicestoprocess.length; _j < _len1; _j++) {
        s = servicestoprocess[_j];
        _results.push((function() {
          var _k, _len2, _ref1, _results1;
          _ref1 = s.containers;
          _results1 = [];
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            c = _ref1[_k];
            _results1.push(tugboat.ducke.container(c.container.Id).logs(function(err, stream) {
              if (err != null) {
                return console.error(err);
              }
              return modem.DemuxStream(stream, process.stdout, process.stderr);
            }));
          }
          return _results1;
        })());
      }
      return _results;
    });
  });
};
