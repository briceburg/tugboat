seq = require '../src/seq'
init_errors = require './errors'

module.exports = (tugboat, groupname, servicenames) ->
  tugboat.init (errors) ->
    return init_errors errors if errors?
    
    console.log()
    if Object.keys(tugboat._groups).length is 0
      console.error '  There are no groups defined in this directory'.red
      console.error()
      process.exit 1
    
    tugboat.ps (err, groups) ->
      if err?
        console.error()
        console.error '  docker is down'.red
        console.error()
        process.exit 1
      
      groupstoprocess = []
      if groupname
        groupname = groupname.replace '.yml', ''
        if !groups[groupname]?
          console.error "  The group '#{groupname}' is not available in this directory".red
          console.error()
          process.exit 1
        groupstoprocess.push groups[groupname]
      else
        groupstoprocess.push g for _, g of groups
      
      for g in groupstoprocess
        do (g) ->
          seq (cb) ->
            console.log "  Killing #{g.name.blue}..."
            console.log()
            cb()
          
          servicestoprocess = []
          if servicenames.length isnt 0
            haderror = no
            for name in servicenames
              if !g.services[name]?
                console.error "  The service '#{name}' is not available in the group '#{g.name}'".red
                haderror = yes
              else
                servicestoprocess.push g.services[name]
            if haderror
              process.exit 1
          else
            servicestoprocess.push service for _, service of g.services
          
          servicestoprocess = servicestoprocess
            .filter (s) ->
              s.containers
                .filter (c) -> c.inspect.State.Running
                .length isnt 0
          
          if servicestoprocess.length is 0
            seq (cb) ->
              console.log "  No containers to kill".magenta
              cb()
          
          for s in servicestoprocess
            outputname = s.pname.cyan
            for c in s.containers
              do (outputname, s, c) ->
                seq "#{outputname} Gracefully terminating #{c.container.Names[0].substr(1).cyan}", (cb) ->
                  tugboat.kill g, s, c (err) ->
                    return cb err if err?
                    cb()
          
          seq (cb) ->
            console.log()
            cb()
            
      seq (cb) ->
        cb()
        callback() if callback?