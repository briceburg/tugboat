module.exports = (tugboat, ducke, group, service, container, callback) ->
  ducke
    .container container.container.Id
    .kill callback