// Generated by CoffeeScript 1.8.0
module.exports = function(errors) {
  var e, err, index, _i, _j, _len, _len1, _ref;
  for (_i = 0, _len = errors.length; _i < _len; _i++) {
    e = errors[_i];
    console.error();
    console.error(("  " + e.path).red);
    _ref = e.errors;
    for (index = _j = 0, _len1 = _ref.length; _j < _len1; index = ++_j) {
      err = _ref[index];
      if (err.name == null) {
        console.error(err);
        continue;
      }
      if (err.name === 'YAMLException') {
        console.error("  " + (index + 1) + ") " + e.path + ":" + (err.mark.line + 1));
        console.error(err.message);
      } else if (err.name === 'TUGBOATFormatException') {
        console.error("  " + (index + 1) + ") " + err.message);
      } else {
        console.error("  " + (index + 1) + ") Unknown error:");
        console.error(err);
      }
    }
  }
  console.error();
  return process.exit(1);
};
