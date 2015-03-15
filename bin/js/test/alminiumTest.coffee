###global describe, it###
###jshint quotmark:true###
"use strict"

path = require("path")
setup = require("../lib/setup.js")
test = require("./resq.js")

describe "ALMinium", ->
  @timeout(10 * 60 * 1000)
  spec01 = {}

  it "can setup a project", (done) ->
    alminium = setup.alminium

    spec01 =
      setup: ->
        url = alminium.defaults.url
        yield setup.initBrowser()
        yield alminium.loginByAdmin(setup.browser, url)
        @request = yield alminium.createRequest(setup.browser, url)
        yield alminium.logout(setup.browser)

        yield @del("/projects/example01.json")
        yield @del("/projects/example02.json")

      when: ->
        yield setup.setup(path.resolve(__dirname, "alminiumTest-01.yml"), true)

      then: ->
        yield @assert
          issues:
            path: "/issues.json?project_id=example01"
            expected:
              "body.issues.length":         1
              "body.issues[0].priority.id": 2
              "body.issues[0].subject":     "issue01"
              "body.issues[0].description": undefined

          memberships:
            path: "/projects/example01/memberships.json"
            expected:
              "body.memberships.length":        1
              "body.memberships[0].user.name":  "CI Jenkins"

      cleanup: ->
        yield alminium.logout(setup.browser)

    test done, spec01


  it "can setup multiple projects", (done) ->
    test done,
      setup: ->
        @request = spec01.request
        @projectId = spec01.response.issues.body.issues[0].project.id
        @issueId = spec01.response.issues.body.issues[0].id
        @userId = spec01.response.memberships.body.memberships[0].user.id
        return

      when: ->
        yield setup.setup(path.resolve(__dirname, "alminiumTest-02.yml"))

      then: ->
        yield @assert
          example01Project:
            path: "/projects/example01.json"
            expected:
              "body.project.id": @projectId

          example01Issues:
            path: "/issues.json?project_id=example01"
            sort: {target: "body.issues", keys: "id"}
            expected:
              "body.issues.length":         2
              "body.issues[0].priority.id": 4
              "body.issues[0].subject":     "issue01"
              "body.issues[0].description": "line 1\r\nline 2\r\nline 3\r\n"
              "body.issues[0].id":          @issueId
              "body.issues[1].priority.id": 2
              "body.issues[1].subject":     "issue02"
              "body.issues[1].description": undefined

          example01Memberships:
            path: "/projects/example01/memberships.json"
            expected:
              "body.memberships.length":        2
              "body.memberships[0].user.name":  "CI Jenkins"
              "body.memberships[0].user.id":    @userId
              "body.memberships[1].user.name":  "BOUZE Taro"

          example02Issues:
            path: "/issues.json?project_id=example02"
            expected:
              "body.issues.length": 0

          example02Memberships:
            path: "/projects/example02/memberships.json"
            expected:
              "body.memberships.length":        1
              "body.memberships[0].user.name":  "BOUZE Taro"
