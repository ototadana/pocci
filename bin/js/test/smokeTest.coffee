###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
co = require("co")
retry = require("co-retry")
jenkinsLib = require("jenkins")
thunkify = require("thunkify")
webdriver = require("../lib/webdriver.js")
test = require("./resq.js")

describe "Login", () ->
  @timeout(60000)
  browser = null

  before (done) ->
    test done,
      setup: ->
        yield webdriver.init()
        browser = webdriver.browser
        return

  after (done) ->
    test done,
      setup: ->
        yield browser.yieldable.end()


  it "ldap", (done) ->
    test done,
      when: ->
        browser
          .url("http://server/ldap/cmd.php?cmd=login_form")
          .setValue("#login", "cn=admin,dc=example,dc=com")
          .setValue("#password", "admin")
          .submitForm("form")

        yield browser.yieldable.call()

      then: ->
        browser.url("http://server/ldap/")
        text = (yield browser.yieldable.getText("td.logged_in"))[0]
        assert.equal(text, "Logged in as: cn=admin")


  it "jenkins", (done) ->
    test done,
      when: ->
        browser
          .url("http://server/jenkins/login")
          .setValue("#j_username", "bouze")
          .setValue("input[type='password'][name='j_password']", "password")

        yield browser.yieldable.call()
        yield browser.yieldable.click("button")

      then: ->
        browser.url("http://server/jenkins/")
        text = (yield browser.yieldable.getText("#header div.login a[href='/jenkins/user/bouze'] > b"))[0]
        assert.equal(text, "bouze")


  it "sonar", (done) ->
    test done,
      when: ->
        browser
          .url("http://server/sonar/sessions/new")
          .setValue("#login", "jenkinsci")
          .setValue("#password", "password")
          .submitForm("form")

        yield browser.yieldable.call()
      then: ->
        browser.url("http://server/sonar/")
        browser.pause(1000)
        text = (yield browser.yieldable.getText("nav"))[0]
        assert.ok(text.indexOf("jenkinsci") > -1)


  it "portal", (done) ->
    loginGitHub = ->
      browser
        .url("http://server/users/sign_in")
        .setValue("#username", "bouze")
        .setValue("#password", "password")
        .submitForm("#new_ldap_user")

      yield browser.yieldable.call()

      browser.url("http://server/profile/")
      text = (yield browser.yieldable.getValue("#user_name"))[0]
      assert.equal(text, "bouze")

    loginALMinium = ->
      browser
        .url("http://server/login")
        .setValue("#username", "bouze")
        .setValue("#password", "password")
        .submitForm("#login-form form")

      yield browser.yieldable.call()

      browser.url("http://server/")
      text = (yield browser.yieldable.getText("#loggedas > a"))[0]
      assert.equal(text, "bouze")

    test done,
      expect: ->
        if process.env.TEMPLATE_NO is "1"
          yield loginGitHub()
        else
          yield loginALMinium()


describe "Jenkins Job", ->

  it "build", (done) ->
    @timeout(30 * 60 * 1000)
    jenkins = jenkinsLib("http://jenkinsci:password@server/jenkins")
    build = thunkify(jenkins.job.build.bind(jenkins.job))
    get = thunkify(jenkins.job.get.bind(jenkins.job))

    assertNotBuilt = (name) ->
      data = yield get(name)
      assert.equal(data.name, name)
      assert.equal(data.color, "notbuilt")
      assert.equal(data.builds.length, 0)

    assertBuilt = (name) ->
      data = yield get(name)
      if data.color is "notbuilt" or data.color is "notbuilt_anime"
        throw new Error("job:#{name}, color:#{data.color}")

    assertBlue = (name) ->
      data = yield get(name)
      assert.equal(data.color, "blue")

    buildJob = (name) ->
      yield assertNotBuilt(name)
      yield build(name)
      console.log("    start : #{name}")
      yield retry(assertBuilt.bind(this, name), {retries: 200, interval: 5000, factor : 1})
      console.log("    end   : #{name}")
      yield assertBlue(name)

    test done,
      expect: ->
        yield buildJob("example-java")
        yield buildJob("example-nodejs")
