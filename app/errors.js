'use strict'

const log = require('./log')

function canWithstand (error) {
  /* eslint-disable no-fallthrough */
  switch (error.code) {
    case '57P01': // terminating connection due to administrator command
    case 'EHOSTUNREACH': // network issue
    case 'ECONNREFUSED': // DB probably down at the moment
    case 'ETIMEDOUT': // network issue
    case 'ECONNRESET': // DB probably went down with an active connection
      log.warn(error, 'Database connection error')
      return true
    default:
      return false
  }
  /* eslint-enable no-fallthrough */
}

/*eslint no-unused-vars:0*/
function middleware (error, req, res, next) {
  res.status(error.status || error.statusCode || 500)
  if (canWithstand(error)) {
    res.locals.error = 'Database is down'
    res.render('dbDown')
    return
  }
  res.locals.error = error.message
  log.error(error, 'express error handler middleware')
  res.render('error')
}

function onUncaughtException (error) {
  if (canWithstand(error)) {
    return
  }
  const fatal = 'Uncaught exception: process will exit'
  // In case log is not writeable, etc
  console.error(fatal, error)
  log.error(error, fatal)
  setTimeout(process.exit.bind(null, 66), 1000)
}

exports.canWithstand = canWithstand
exports.middleware = middleware
exports.onUncaughtException = onUncaughtException
