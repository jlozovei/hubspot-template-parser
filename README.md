# Hubspot Template Parser

A simple parser to automatically create Hubspot HubL's custom modules inside your plain HTML templates.  


## How To

This parser can be used within any kind of project that includes Hubspot templates with custom HTML markup. You can use it with gulp/grunt tasks, or as a CLI tool.  

As a task, it can be called through a function passing two args:
- the plain HTML template path
- the default configuration (hubspot.config.js object)

And, as a CLI, you can customize the args, like:
- the modules you want to parse
- source and dist templates path

## Improvements

I'm working on replacing the quotes inside elements' `innerText`, because you can break the template with a trailling single quotation mark within Hubspot's Design Manager/Tools.

