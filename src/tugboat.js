// Generated by CoffeeScript 1.8.0
var Docke, TUGBOATFormatException, Tugboat, copy, fs, parallel, path, yaml,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Docke = require('docke');

yaml = require('js-yaml');

fs = require('fs');

path = require('path');

TUGBOATFormatException = (function(_super) {
  __extends(TUGBOATFormatException, _super);

  function TUGBOATFormatException(message) {
    this.name = 'TUGBOATFormatException';
    this.message = message;
  }

  return TUGBOATFormatException;

})(Error);

copy = function(source, target) {
  var key, value, _results;
  _results = [];
  for (key in source) {
    value = source[key];
    if (typeof value === 'object') {
      if ((target[key] == null) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      _results.push(copy(value, target[key]));
    } else {
      _results.push(target[key] = value);
    }
  }
  return _results;
};

parallel = function(tasks, callback) {
  var count, result;
  count = tasks.length;
  result = function(cb) {
    var task, _i, _len, _results;
    if (count === 0) {
      return cb();
    }
    _results = [];
    for (_i = 0, _len = tasks.length; _i < _len; _i++) {
      task = tasks[_i];
      _results.push(task(function() {
        count--;
        if (count === 0) {
          return cb();
        }
      }));
    }
    return _results;
  };
  if (callback != null) {
    result(callback);
  }
  return result;
};

module.exports = Tugboat = (function() {
  function Tugboat(options) {
    this.init = __bind(this.init, this);
    this._loadGroup = __bind(this._loadGroup, this);
    this._options = {
      groupsdir: process.cwd()
    };
    copy(options, this._options);
    this._docke = new Docke.API(Docke.Parameters(options));
  }

  Tugboat.prototype._loadGroup = function(item, cb) {
    return fs.readFile(item, {
      encoding: 'utf8'
    }, (function(_this) {
      return function(err, content) {
        var e;
        if (err != null) {
          return cb(err);
        }
        try {
          content = yaml.safeLoad(content);
        } catch (_error) {
          e = _error;
          if (e != null) {
            return cb(e);
          }
        }
        if (content instanceof Array) {
          return cb(new TUGBOATFormatException('Expecting names and definitions of docker containers.'));
        }
        return cb(null, {
          name: path.basename(item, '.yml'),
          path: item,
          dockers: content
        });
      };
    })(this));
  };

  Tugboat.prototype.init = function(callback) {
    var e, errors, item, items, results, tasks, _fn, _i, _len;
    if (this._groups == null) {
      this._groups = {};
    }
    try {
      items = fs.readdirSync(this._options.groupsdir);
    } catch (_error) {
      e = _error;
      return callback([
        {
          path: this._options.groupsdir,
          error: e
        }
      ]);
    }
    tasks = [];
    errors = [];
    results = [];
    _fn = (function(_this) {
      return function(item) {
        return tasks.push(function(cb) {
          item = "" + (process.cwd()) + "/" + item;
          return _this._loadGroup(item, function(err, group) {
            if (err != null) {
              errors.push({
                path: item,
                error: err
              });
              return cb();
            }
            _this._groups[group.name] = group;
            return cb();
          });
        });
      };
    })(this);
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      if (!item.match(/\.yml$/)) {
        continue;
      }
      _fn(item);
    }
    return parallel(tasks, function() {
      if (errors.length !== 0) {
        return callback(errors);
      }
      return callback(null);
    });
  };

  return Tugboat;

})();
