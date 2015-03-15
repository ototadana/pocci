###jshint quotmark:true###
"use strict"

assert = require("chai").assert
cheerio = require("cheerio")
co = require("co")
getPathValue = require("chai/lib/chai/utils/getPathValue")
server = require("co-request")
assertStatus = require("../lib/util.js").assertStatus
toArray = require("../lib/util.js").toArray


module.exports = (done, spec) ->

  spec.get = (address, assertExists) ->
    return yield getValue(spec.request, address, assertExists)

  spec.post = (address, body) ->
    yield postResource(spec.request, address, body)

  spec.put = (address, body) ->
    yield putResource(spec.request, address, body)

  spec.del = (address) ->
    yield deleteResource(spec.request, address)

  spec.response = {}
  spec.assert = (assertionSpecs) ->
    yield assertResources(spec.request, assertionSpecs, spec.response)

  if not spec.tasks then spec.tasks = [ "setup", "when", "then", "expect", "cleanup" ]

  co ->
    yield execute(spec.tasks, spec)
    done()
  .catch (err) ->
    done(err)


execute = (tasks, spec) ->
  if Array.isArray(tasks) then (yield execute(task, spec)) for task in tasks
  if typeof tasks is "function"
    f = tasks.bind(spec)
    if tasks.constructor.name is "GeneratorFunction" then (yield f()) else f()
  if typeof tasks is "string"
    if spec[tasks] then (yield execute(spec[tasks], spec))


assertResources = (request, specs, responses) ->
  for name, spec of specs

    console.log("\n#{name}  (#{spec.path})")
    responses[name] = response = (yield server.get(request(spec.path)))
    if specs.debug then console.log(JSON.stringify(response, null, "  "))

    if spec.sort then sort(response, toArray(spec.sort))

    for key, value of spec.expected
      console.log("  assert: #{key} === #{value}")
      if typeof value is "undefined"
        assert.notDeepProperty(response, key)
      else
        assert.deepPropertyVal(response, key, value)

  return


deleteResource = (request, address) ->
  response = (yield server.del(request(address)))
  assertStatus(response, "response.statusCode < 300 || response.statusCode === 404")


postResource = (request, address, body) ->
  response = (yield server.post(request(address, body)))
  assertStatus(response, "response.statusCode < 300")


putResource = (request, address, body) ->
  response = (yield server.put(request(address, body)))
  assertStatus(response, "response.statusCode < 300")


getValue = (request, address, assertExists) ->
  path = address.split("@")
  response = (yield server.get(request(path[1])))
  contentType = response.headers["content-type"]
  console.log(JSON.stringify(response, null, "  "))
  if not path[0] then return response
  if contentType is "application/json" then return getJsonValue(path[0], response, assertExists)
  return getHtmlValue(path[0], response, assertExists)


getJsonValue = (path, response, assertExists) ->
  if typeof response.body is "string" then response.body = JSON.parse(response.body)
  if assertExists then assert.deepProperty(response, path)
  return getPathValue(path, response)


getHtmlValue = (path, response, assertExists) ->
  if assertExists then assertStatus(response, "response.statusCode < 300")
  $ = cheerio.load(response.body)
  return $(path).first().text()


sort = (response, sortOptions) ->
  sortBy = (keys, target) ->
    target.sort (a, b) ->
      for key in keys
        valueA = getPathValue(key, a)
        valueB = getPathValue(key, b)
        if valueA > valueB
          return 1
        else if valueA < valueB 
          return -1

      return 0

  for sortOption in sortOptions
    keys = toArray(sortOption.keys)
    target = getPathValue(sortOption.target, response)
    sortBy(keys, target)

  return
