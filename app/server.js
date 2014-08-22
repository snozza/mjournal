#!/usr/bin/env node
var _ = require("lodash");
var app = require("app");
var config = require("config3");
var log = require("app/log");
//eslint bug thinks "setup" is a global from mocha
//https://github.com/eslint/eslint/issues/1059
var setup2 = require("app/db/setup");

process.on("uncaughtException", function (error) {
  log.error(error, "uncaught exception. Process will exit.");
  setTimeout(process.exit.bind(null, 66), 1000);
});

log.debug(
  {
    env: process.env.NODE_ENV,
    db: _.without(config.db, "password")
  },
  "%s server process starting", config.pack.name
);

setup2.init(function (error) {
  if (error) {
    log.error(error, "Error ensuring database is ready. Process will exit.");
    setTimeout(process.exit.bind(null, 20), 1000);
  }
  app.listen(config.port, function(error) {
    if (error) {
      log.error(error, "Unable to bind network socket. Exiting");
      /*eslint no-process-exit:0*/
      setTimeout(process.exit.bind(null, 10), 1000);
    }
    log.info(
      {port: config.port},
       "%s express app listening", config.pack.name
    );
  });
});
