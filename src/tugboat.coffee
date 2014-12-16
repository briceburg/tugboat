Docke = require 'docke'
yaml = require 'js-yaml'
fs = require 'fs'
path = require 'path'
parse_configuration = require './configuration'

# Copy all of the properties on source to target, recurse if an object
copy = (source, target) ->
  for key, value of source
    if typeof value is 'object'
      target[key] = {} if !target[key]? or typeof target[key] isnt 'object'
      copy value, target[key]
    else
      target[key] = value

parallel = (tasks, callback) ->
  count = tasks.length
  result = (cb) ->
    return cb() if count is 0
    for task in tasks
      task ->
        count--
        cb() if count is 0
  result(callback) if callback?
  result

module.exports = class Tugboat
  constructor: (options) ->
    @_options =
      groupsdir: process.cwd()
    
    copy options, @_options
    
    @_docke = new Docke.API Docke.Parameters options
  
  _loadGroup: (item, cb) =>
    fs.readFile item, encoding: 'utf8', (err, content) =>
      return cb [err] if err?
      try
        content = yaml.safeLoad content
      catch e
        return cb [e] if e?
      
      name = path.basename item, '.yml'
      
      parse_configuration name, content, (errors, dockers) ->
        return cb errors if errors?
        
        cb null,
          name: name
          path: item
          dockers: dockers
  
  init: (callback) =>
    @_groups = {} if !@_groups?
    
    try
      items = fs.readdirSync @_options.groupsdir
    catch e
      return callback [
        path: @_options.groupsdir
        error: e
      ]
    
    tasks = []
    errors = []
    results = []
    for item in items
      continue if !item.match /\.yml$/
      do (item) =>
        tasks.push (cb) =>
          item = "#{@_options.groupsdir}/#{item}"
          @_loadGroup item, (errs, group) =>
            if errs?
              errors.push
                path: item
                errors: errs
              return cb()
            @_groups[group.name] = group
            cb()
    parallel tasks, ->
      return callback errors if errors.length isnt 0
      callback null