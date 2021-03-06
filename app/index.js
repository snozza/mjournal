'use strict'

var _ = require('lodash')
var byKey = require('./users/by-key')
var compression = require('compression')
var config = require('config3')
var cookieParser = require('cookie-parser')
var errors = require('./errors')
var express = require('express')
var log = require('./log')
var paths = require('./paths')
var pg = require('pg')
var session = require('express-session')
var sharify = require('sharify')
var stylusBundle = require('./theme/stylus-bundle')
var themeMW = require('./middleware/theme')

const ONE_DAY_MS = 1000 * 60 * 60 * 24 * 1

function home (req, res) {
  res.render('home')
}

function appCSS (req, res, next) {
  stylusBundle(req.params[0], function (error, cssText) {
    if (error) {
      log.error({
        err: error
      }, 'Error rendering CSS')
      next(error)
      return
    }
    res.type('css')
    res.send(cssText)
  })
}

var pool = new pg.Pool({
  database: config.MJ_PG_DATABASE,
  host: config.MJ_PG_HOST,
  password: config.MJ_PG_PASSWORD,
  port: config.MJ_PG_PORT,
  user: config.MJ_PG_USER
})
var PGStore = require('connect-pg-simple')(session)
var app = express()
_.extend(sharify.data, _.pick(config, 'MJ_APP_NAME', 'MJ_VERSION'))
sharify.data.sessionTtl = ONE_DAY_MS
_.extend(app.locals, sharify.data)
app.set('view engine', 'pug')
app.set('views', __dirname)
app.set('trust proxy', true)
app.disable('x-powered-by')
app.use(sharify)
app.use(compression())
app.use((req, res, next) => {
  res.header('X-Frame-Options', 'DENY')
  res.header('X-Content-Type-Options', 'nosniff')
  res.header('X-XSS-Protection', '1')
  next()
})
app.get(/\/mjournal-?(\w+)?\.css/, appCSS)
app.use(express.static(paths.wwwroot))
app.use(express.static(paths.browser))
app.use(cookieParser())
app.use(session({
  store: new PGStore({pool}),
  secret: config.MJ_SESSION_SECRET,
  cookie: {
    httpOnly: true,
    maxAge: ONE_DAY_MS,
    secure: false
  },
  resave: false,
  rolling: true,
  saveUninitialized: true
}))
app.use(function (req, res, next) {
  res.locals.user = req.user = req.session.user
  if (req.user) {
    res.locals.sharify.data.user = {
      id: req.user.id,
      theme: req.user.theme || 'moleskine'
    }
  }
  next()
})
app.use(byKey)
app.get('/', require('./middleware/db-down'), themeMW, home)
app.get('/docs', themeMW, function (req, res) {
  res.render('docs/docs')
})
// app.use('/api', require('./middleware/dev-delay'))
app.use('/api/users', require('./users/api'))
app.use('/api/entries', require('./entries/api'))
app.use(errors.middleware)
module.exports = app
