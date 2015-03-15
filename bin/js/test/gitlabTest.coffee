###global describe, it###
###jshint quotmark:true###
"use strict"

path = require("path")
setup = require("../lib/setup.js")
test = require("./resq.js")

describe "GitLab", ->
  @timeout(10 * 60 * 1000)
  spec01 = {}

  it "can setup a group", (done) ->
    spec01 =
      setup: ->
        gitlab = setup.gitlab
        url = gitlab.defaults.url
        yield setup.initBrowser()
        yield gitlab.loginByAdmin(setup.browser, url)
        @request = yield gitlab.createRequest(setup.browser, url)
        yield gitlab.logout(setup.browser)

        yield @del("/projects/#{yield @get("body[0].id@/projects/search/project01")}")
        yield @del("/groups/#{yield @get("body[0].id@/groups?search=group01")}")
        yield @del("/groups/#{yield @get("body[0].id@/groups?search=group02")}")

      when: ->
        yield setup.setup(path.resolve(__dirname, "gitlabTest-01.yml"), true)

      then: ->
        projectId = yield @get("body[0].id@/projects/search/project01", true)
        groupId = yield @get("body[0].id@/groups?search=group01", true)

        yield @assert
          group01:
            path:   "/groups?search=group01"
            expected:
              "body.length":  1
              "body[0].name": "group01"

          project01:
            path:   "/projects/search/project01"
            expected:
              "body.length":            1
              "body[0].public":         true
              "body[0].namespace.id":   groupId
              "body[0].namespace.name": "group01"

          project01Issues:
            path: "/projects/#{projectId}/issues"
            expected:
              "body.length":          1
              "body[0].project_id":   projectId
              "body[0].title":        "issue01"
              "body[0].description":  null

          group01Members:
            path:   "/groups/#{groupId}/members"
            expected:
              "body.length":          1
              "body[0].username":     "jenkinsci"
              "body[0].access_level": 50

    test(done, spec01)

  it "can setup multiple groups", (done) ->
    test done,
      setup: ->
        @request = spec01.request
        @groupId = spec01.response.project01.body[0].namespace.id
        @projectId = spec01.response.project01.body[0].id
        @issueId = spec01.response.project01Issues.body[0].id
        return

      when: ->
        yield setup.setup(path.resolve(__dirname, "gitlabTest-02.yml"));

      then: ->
        group02Id = yield @get("body[0].id@/groups?search=group02", true)

        yield @assert
          group01:
            path:   "/groups?search=group01"
            expected:
              "body.length":  1
              "body[0].id":   @groupId
              "body[0].name": "group01"

          group02:
            path:   "/groups?search=group02"
            expected:
              "body.length":  1
              "body[0].name": "group02"

          project01:
            path:   "/projects/search/project01"
            expected:
              "body.length":            1
              "body[0].id":             @projectId
              "body[0].public":         true
              "body[0].namespace.id":   @groupId
              "body[0].namespace.name": "group01"

          project01Issues:
            path: "/projects/#{@projectId}/issues"
            sort:   {target: "body", keys: "id"}
            expected:
              "body.length":          2
              "body[0].id":           @issueId
              "body[0].title":        "issue01"
              "body[0].description":  "test"
              "body[1].title":        "issue02"
              "body[1].description":  "Line 1\nLine 2\nLine 3\n"

          project02:
            path:   "/projects/search/project02"
            expected:
              "body.length":            1
              "body[0].public":         true
              "body[0].namespace.name": "group01"

          group01Members:
            path:   "/groups/#{@groupId}/members"
            sort:   {target: "body", keys: "id"}
            expected:
              "body.length":          2
              "body[0].username":     "jenkinsci"
              "body[0].access_level": 50
              "body[1].username":     "bouze"
              "body[1].access_level": 50

          group02Members:
            path:   "/groups/#{group02Id}/members"
            expected:
              "body.length":          1
              "body[0].username":     "bouze"
              "body[0].access_level": 50
