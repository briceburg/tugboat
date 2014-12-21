// Generated by CoffeeScript 1.8.0
var TUGBOATFormatException, isboolean, isnumber, isobjectofstringsornull, isstring, isstringarray, parse_port, resolve, validation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

resolve = require('path').resolve;

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

parse_port = function(port) {
  var tcp, udp;
  udp = '/udp';
  tcp = '/tcp';
  if (port.substr(port.length - udp.length) !== udp && port.substr(port.length - tcp.length) !== tcp) {
    port = "" + port + "/tcp";
  }
  return port;
};

module.exports = function(groupname, services, path, cb) {
  var chunks, config, count, env, errors, key, name, p, result, results, value, _i, _j, _len, _len1, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
  if (typeof services !== 'object') {
    return cb([new TUGBOATFormatException('This YAML file is in the wrong format. Tugboat expects names and definitions of services.')]);
  }
  errors = [];
  if (!groupname.match(/^[a-zA-Z0-9-]+$/)) {
    errors.push(new TUGBOATFormatException("The YAML file " + groupname.cyan + " is not a valid group name."));
  }
  for (name in services) {
    config = services[name];
    if (!name.match(/^[a-zA-Z0-9-]+$/)) {
      errors.push(new TUGBOATFormatException("" + name.cyan + " is not a valid service name."));
    }
    if (typeof services !== 'object' || services instanceof Array) {
      errors.push(new TUGBOATFormatException("The value of " + name.cyan + " is not an object of strings."));
      continue;
    }
    if ((config.dns != null) && typeof config.dns === 'string') {
      config.dns = [config.dns];
    }
    if ((config.environment != null) && config.environment instanceof Array) {
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
        errors.push(new TUGBOATFormatException("In the service " + name.cyan + " " + key.cyan + " is not a known configuration option."));
        continue;
      }
      if (!validation[key](value)) {
        errors.push(new TUGBOATFormatException("In the service " + name.cyan + " the value of " + key.cyan + " was an unexpected format."));
        continue;
      }
    }
    if (config.volumes) {
      config.volumes = config.volumes.map(function(v) {
        chunks = v.split(':');
        chunks[0] = resolve(path, chunks[0]);
        return chunks.join(':');
      });
    }
    if ((config.environment != null) && isobjectofstringsornull(config.environment)) {
      results = [];
      _ref1 = config.environment;
      for (key in _ref1) {
        value = _ref1[key];
        if (value === '' || value === null && (process.env[key] != null)) {
          results.push("" + key + "=" + process.env[key]);
        } else {
          results.push("" + key + "=" + value);
        }
      }
      config.environment = results;
    }
    if (config.expose != null) {
      results = {};
      config.expose = config.expose.map(function(e) {
        return results[parse_port(e)] = {};
      });
      config.expose = results;
    }
    if (config.ports != null) {
      results = {};
      _ref2 = config.ports;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        p = _ref2[_j];
        chunks = p.split(':');
        if (chunks.length === 1) {
          results[parse_port(chunks[0])] = [
            {
              HostIp: '0.0.0.0',
              HostPort: chunks[0]
            }
          ];
        } else if (chunks.length === 2) {
          results[parse_port(chunks[1])] = [
            {
              HostIp: '0.0.0.0',
              HostPort: chunks[0]
            }
          ];
        } else if (chunks.length === 3) {
          results[parse_port(chunks[2])] = [
            {
              HostIp: chunks[0],
              HostPort: chunks[1]
            }
          ];
        } else {
          errors.push(new TUGBOATFormatException("In the service " + name.cyan + " the port binding '" + p.cyan + "'' was an unexpected format."));
        }
      }
      config.ports = results;
    }
    config.name = "" + groupname + "_" + name;
    if (config.command != null) {
      config.command = config.command.split(' ');
    }
    if (config.image == null) {
      config.image = config.name;
    }
  }
  for (name in services) {
    config = services[name];
    services[name] = {
      name: config.name,
      params: {
        Image: config.image,
        Cmd: (_ref3 = config.command) != null ? _ref3 : null,
        User: (_ref4 = config.user) != null ? _ref4 : '',
        Memory: (_ref5 = config.mem_limit) != null ? _ref5 : 0,
        Hostname: (_ref6 = config.hostname) != null ? _ref6 : null,
        Domainname: (_ref7 = config.domainname) != null ? _ref7 : null,
        Entrypoint: (_ref8 = config.entrypoint) != null ? _ref8 : null,
        WorkingDir: (_ref9 = config.working_dir) != null ? _ref9 : '',
        Env: config.environment,
        ExposedPorts: (_ref10 = config.expose) != null ? _ref10 : null,
        HostConfig: {
          Binds: (_ref11 = config.volumes) != null ? _ref11 : null,
          Links: (_ref12 = config.links) != null ? _ref12 : null,
          Dns: (_ref13 = config.dns) != null ? _ref13 : null,
          NetworkMode: (_ref14 = config.net) != null ? _ref14 : '',
          Privileged: (_ref15 = config.privileged) != null ? _ref15 : false,
          PortBindings: (_ref16 = config.ports) != null ? _ref16 : null
        }
      }
    };
  }
  if (errors.length !== 0) {
    return cb(errors);
  }
  return cb(null, services);
};
