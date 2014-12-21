var _ = require("lodash");
var express = require("express");
var json = require("body-parser").json();
var log = require("app/log");
var operations = require("./operations");

function respond(res) {
  return function _respond(error, user) {
    if (error) {
      res.status(error.status || 403).send(error);
      return;
    }
    var session = res.req.session;
    session.user = res.req.user = user;
    session.save(function (error) {
      if (error) {
        log.error(error, "session.save failed");
        return;
      }
      res.send(user);
    });
  };
}

function signIn(req, res) {
  log.debug({email: req.body.email}, "sign-in attempt");
  var options = _.pick(req.body, "email", "password");
  operations.signIn(options, respond(res));
}

function signUp(req, res) {
  log.debug({email: req.body.email}, "sign-up attempt");
  var options = _.pick(req.body, "email", "password");
  res.status(201);
  operations.signUp(options, respond(res));
}

function signOut(req, res) {
  log.debug({email: req.user.email}, "signing out");
  req.session.destroy(function (error) {
    if (error) {
      log.error(error, "session.destroy failed");
    }
    res.redirect("/");
  });
}

function createKey(req, res, next) {
  log.debug({email: req.user.email}, "creating key");
  var options = {
    user: req.user
  };
  res.status(201);
  operations.createKey(options, function (error, result) {
    if (error) {
      next(error);
      return;
    }
    res.json({value: result});
  });
}

var app = express();
app.post("/sign-in", json, signIn);
app.post("/sign-up", json, signUp);
app.get("/sign-out", signOut);
app.post("/key", createKey);

module.exports = app;
