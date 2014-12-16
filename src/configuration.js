// Generated by CoffeeScript 1.8.0
var TUGBOATFormatException, isboolean, isnumber, isobjectofstringsornull, isstring, isstringarray, validation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TUGBOATFormatException = (function(_super) {
  __extends(TUGBOATFormatException, _super);

  function TUGBOATFormatException(message) {
    this.name = 'TUGBOATFormatException';
    this.message = message;
  }

  return TUGBOATFormatException;

})(Error);

isstring = function(s) {
  return typeof s === 'string';
};

isnumber = function(s) {
  return typeof s === 'number';
};

isboolean = function(s) {
  return typeof s === 'boolean';
};

isstringarray = function(s) {
  var i, _i, _len;
  if (typeof s === 'array') {
    return false;
  }
  for (_i = 0, _len = s.length; _i < _len; _i++) {
    i = s[_i];
    if (!isstring(i)) {
      return false;
    }
  }
  return true;
};

isobjectofstringsornull = function(s) {
  var i, _;
  if (typeof s !== 'object') {
    return false;
  }
  for (_ in s) {
    i = s[_];
    if (i === null) {
      continue;
    }
    if (isstring(i)) {
      continue;
    }
    return false;
  }
  return true;
};

validation = {
  build: isstring,
  image: isstring,
  command: isstring,
  links: isstringarray,
  ports: isstringarray,
  expose: isstringarray,
  volumes: isstringarray,
  environment: isobjectofstringsornull,
  net: isstring,
  dns: isstringarray,
  working_dir: isstring,
  entrypoint: isstring,
  user: isstring,
  hostname: isstring,
  domainname: isstring,
  mem_limit: isnumber,
  privileged: isboolean
};

module.exports = function(groupname, containers, cb) {
  var chunks, config, count, env, errors, key, name, result, value, _i, _len, _ref, _ref1;
  if (typeof containers !== 'object') {
    return cb([new TUGBOATFormatException('This YAML file is in the wrong format. Tugboat expects names and definitions of docker containers.')]);
  }
  errors = [];
  if (!groupname.match(/^[a-zA-Z0-9]+$/)) {
    errors.push(new TUGBOATFormatException("The YAML file " + groupname.cyan + " is not a valid group name."));
  }
  for (name in containers) {
    config = containers[name];
    if (!name.match(/^[a-zA-Z0-9_-]+$/)) {
      errors.push(new TUGBOATFormatException("" + name.cyan + " is not a valid docker container name."));
    }
    if (typeof containers !== 'object' || containers instanceof Array) {
      errors.push(new TUGBOATFormatException("The value of " + name.cyan + " is not an object of strings."));
      continue;
    }
    if ((config.dns != null) && typeof config.dns === 'string') {
      config.dns = [config.dns];
    }
    if ((config.environment != null) && typeof config.environment === 'array') {
      result = {};
      _ref = config.environment;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        env = _ref[_i];
        chunks = env.split('=');
        key = chunks[0];
        value = chunks.slice(1).join('=');
        result[key] = value;
      }
      config.environment = result;
    }
    count = 0;
    if (config.build != null) {
      count++;
    }
    if (config.image != null) {
      count++;
    }
    if (count !== 1) {
      errors.push(new TUGBOATFormatException("" + name.cyan + " requires either a build or an image value."));
    }
    for (key in config) {
      value = config[key];
      if (validation[key] == null) {
        errors.push(new TUGBOATFormatException("In the docker " + name.cyan + " " + key.cyan + " is not a known configuration option."));
        continue;
      }
      if (!validation[key](value)) {
        errors.push(new TUGBOATFormatException("In the docker " + name.cyan + " the value of " + key.cyan + " was an unexpected format."));
        continue;
      }
    }
    if ((config.environment != null) && isobjectofstringsornull(config.environment)) {
      _ref1 = config.environment;
      for (key in _ref1) {
        value = _ref1[key];
        if (value === '' || value === null && (process.env[key] != null)) {
          config.environment[key] = process.env[key];
        }
      }
    }
    config.name = "" + groupname + "_" + name;
  }
  if (errors.length !== 0) {
    return cb(errors);
  }
  return cb(null, containers);
};
