// Generated by CoffeeScript 1.8.0
var Tugboat, args, build, cmds, command, commands, tugboat, usage, usage_error;

require('colors');

Tugboat = require('../src/tugboat');

usage = "👾\n\n  Usage: " + 'tug'.cyan + " command parameters\n\n  Common:\n  \n    ps          List all running and available groups\n    up          Update and run services\n    down        Stop services\n    diff        Describe the changes needed to update\n  \n  Management:\n  \n    cull        Terminate, stop and remove services\n    recreate    Terminate, stop, remove and recreate services\n    rm          Delete services\n    kill        Gracefully terminate services\n    build       Build services\n    rebuild     Build services from scratch\n";

build = require('./build');

commands = {
  status: require('./status'),
  diff: require('./diff'),
  up: require('./up'),
  rm: require('./rm'),
  down: require('./down'),
  ps: require('./ps'),
  pull: require('./pull'),
  cull: require('./cull'),
  kill: require('./kill'),
  recreate: require('./recreate'),
  build: function(tugboat, names) {
    return build(tugboat, names, true);
  },
  rebuild: function(tugboat, names) {
    return build(tugboat, names, false);
  }
};

process.on('uncaughtException', function(err) {
  console.error('  Caught exception: '.red);
  return console.error(err.stack);
});

usage_error = (function(_this) {
  return function(message) {
    console.error();
    console.error(("  " + message).magenta);
    console.error();
    console.error(usage);
    return process.exit(1);
  };
})(this);

args = process.argv.slice(2);

tugboat = new Tugboat(args);

if (args.length === 0) {
  console.error(usage);
  return commands.status(tugboat);
}

cmds = {
  status: function() {
    if (args.length === 0) {
      return commands.status(tugboat);
    }
    return usage_error('tug status requires no arguments');
  },
  ps: function() {
    return commands.ps(tugboat, args);
  },
  diff: function() {
    if (args.length > 0) {
      return commands.diff(tugboat, args[0], args.slice(1));
    }
    return usage_error('tug diff requires a group name');
  },
  start: function() {
    return cmds.up();
  },
  up: function() {
    if (args.length > 0) {
      return commands.up(tugboat, args[0], args.slice(1));
    }
    return usage_error('tug up requires a group name');
  },
  stop: function() {
    return cmds.down();
  },
  down: function() {
    return commands.down(tugboat, args[0], args.slice(1));
  },
  kill: function() {
    return commands.kill(tugboat, args[0], args.slice(1));
  },
  nuke: function() {
    return cmds.cull();
  },
  cull: function() {
    return commands.cull(tugboat, args[0], args.slice(1));
  },
  restart: function() {
    return cmds.recreate();
  },
  recreate: function() {
    return commands.recreate(tugboat, args[0], args.slice(1));
  },
  rm: function() {
    if (args.length > 0) {
      return commands.rm(tugboat, args[0], args.slice(1));
    }
    return usage_error('tug rm requires a group name');
  },
  build: function() {
    return commands.build(tugboat, args);
  },
  rebuild: function() {
    return commands.rebuild(tugboat, args);
  },
  pull: function() {
    return commands.pull(tugboat, args);
  }
};

command = args[0];

args.shift();

if (cmds[command] != null) {
  return cmds[command]();
}

usage_error("" + command + " is not a known tug command");
