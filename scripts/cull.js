// Generated by CoffeeScript 1.8.0
module.exports = function(tugboat, ducke, seq, group, service, container, callback) {
  if (!container.inspect.State.Running) {
    return tugboat.rm(group, service, container, callback);
  }
  return tugboat.stop(group, service, container, function(err) {
    if (err != null) {
      return callback(err);
    }
    return tugboat.rm(group, service, container, callback);
  });
};