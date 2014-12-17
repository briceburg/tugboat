class TUGBOATFormatException extends Error
  constructor: (message) ->
    @name = 'TUGBOATFormatException'
    @message = message

# Helper functions to check types
isstring = (s) -> typeof s is 'string'
isnumber = (s) -> typeof s is 'number'
isboolean = (s) -> typeof s is 'boolean'
isstringarray = (s) ->
  return no if typeof s is 'array'
  for i in s
    return no if !isstring i
  yes
isobjectofstringsornull = (s) ->
  return no if typeof s isnt 'object'
  for _, i of s
    continue if i is null
    continue if isstring i
    return no
  yes

# The expecations
validation =
  build: isstring
  image: isstring
  command: isstring
  links: isstringarray
  ports: isstringarray
  expose: isstringarray
  volumes: isstringarray
  environment: isobjectofstringsornull
  net: isstring
  dns: isstringarray
  working_dir: isstring
  entrypoint: isstring
  user: isstring
  hostname: isstring
  domainname: isstring
  mem_limit: isnumber
  privileged: isboolean

module.exports = (groupname, services, cb) ->
  if typeof services isnt 'object'
    return cb [
      new TUGBOATFormatException 'This YAML file is in the wrong format. Tugboat expects names and definitions of services.'
    ]
  
  # Errors are reported as a list
  errors = []
  
  # We use underscore for separating, otherwise this is the same
  # as the allowed characters in a docker name
  if !groupname.match /^[a-zA-Z0-9-]+$/
    errors.push new TUGBOATFormatException "The YAML file #{groupname.cyan} is not a valid group name."
  
  for name, config of services
    if !name.match /^[a-zA-Z0-9-]+$/
      errors.push new TUGBOATFormatException "#{name.cyan} is not a valid service name."
    if typeof services isnt 'object' or services instanceof Array
      errors.push new TUGBOATFormatException "The value of #{name.cyan} is not an object of strings."
      continue
    
    # Fig syntax allows a single value, let's convert that
    if config.dns? and typeof config.dns is 'string'
      config.dns = [config.dns]
    
    # Fig syntax allows strings of x=y let's convert that
    if config.environment? and typeof config.environment is 'array'
      result = {}
      for env in config.environment
        chunks = env.split '='
        key = chunks[0]
        value = chunks[1..].join '='
        result[key] = value
      config.environment = result
    
    # Either build or image, not both but at least one
    count = 0
    count++ if config.build?
    count++ if config.image?
    if count isnt 1
      errors.push new TUGBOATFormatException "#{name.cyan} requires either a build or an image value."
    
    # Compare all values against expected
    for key, value of config
      if !validation[key]?
        errors.push new TUGBOATFormatException "In the service #{name.cyan} #{key.cyan} is not a known configuration option."
        continue
      if !validation[key] value
        errors.push new TUGBOATFormatException "In the service #{name.cyan} the value of #{key.cyan} was an unexpected format."
        continue
    
    # Fig - copy current environment variables into empty values
    if config.environment? and isobjectofstringsornull config.environment
      for key, value of config.environment
        if value is '' or value is null and process.env[key]?
          config.environment[key] = process.env[key]
    
    config.name = "#{groupname}_#{name}"
  
  return cb errors if errors.length isnt 0
  cb null, services