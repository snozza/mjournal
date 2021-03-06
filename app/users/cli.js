#!/usr/bin/env node
'use strict'

const cli = require('../cli')
const program = require('commander')
const operations = require('./operations')
const promptly = require('promptly')

function signUp (email) {
  const prompt = 'password for ' + email + ': '
  promptly.password(prompt, function (ignore, password) {
    console.log('registering ' + email)
    operations.signUp({
      email: email,
      password: password
    }, function (error2, user) {
      cli.exitIfError(error2)
      console.log(user)
      /* eslint no-process-exit:0 */
      process.exit()
    })
  })
}

function keyMW (options) {
  operations.createKey(options, function (error, key) {
    cli.exitIfError(error)
    console.log(key)
    process.exit()
  })
}

program.description('operate on user records')
program.command('sign-up <email>')
  .description('register a new user account').action(signUp)

const keyStack = cli.command(
  program, 'create-key', 'create an authentication key for CLI/API access')
cli.signInMW(keyStack).use(keyMW)

program.parse(process.argv)
