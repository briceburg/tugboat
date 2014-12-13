require 'colors'

series = (tasks, callback) ->
  tasks = tasks.slice 0
  next = (cb) ->
    return cb() if tasks.length is 0
    task = tasks.shift()
    task -> next cb
  result = (cb) -> next cb
  result(callback) if callback?
  result

module.exports =
  status: (tugboat) ->
    tugboat._docke.ping (err, isUp) ->
      if err? or !isUp
        console.error()
        console.error '  docker is down'.red
        console.error()
        process.exit 1
      else
        tugboat._docke.ps (err, results) ->
          if err? or results.length is 0
            console.error()
            console.error '  There are no docker containers on this system'.magenta
            console.error()
          else
            ess = (num, s, p) -> if num is 1 then s else p
            running = results
              .filter (d) -> d.inspect.State.Running
              .length
            stopped = results.length - running
            console.error()
            console.error "  There #{ess running, 'is', 'are'} #{running.toString().green} running container#{ess running, '', 's'} and #{stopped.toString().red} stopped container#{ess stopped, '', 's'}"
            console.error()
          process.exit 1
  
  ps: (tugboat) ->
    tugboat._docke.ps (err, results) ->
      if err?
        console.error err
        process.exit 1
      
      if results.length is 0
        console.error()
        console.error '  There are no docker containers on this system'.magenta
        console.error()
        return
      
      console.log()
      for result in results
        status = if result.inspect.State.Running
          result.inspect.NetworkSettings.IPAddress.toString().blue
        else
          'stopped'.red
        status += ' ' while status.length < 26
        
        name = result.container.Names[0][1..]
        image = result.inspect.Config.Image
        
        console.log "  #{status} #{name} (#{image})"
      console.log()
  
  test: (tugboat) ->
    tugboat.init (errors) ->
      console.log errors
      console.log tugboat._groups