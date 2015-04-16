/**
 * Ferropoly Main
 *
 * This is the "real" application file
 * Created by kc on 14.04.15.
 */
'use strict';
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var settings = require('./settings');
var authStrategy = require('../common/lib/authStrategy');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
// Routes includes
var routes = require('./routes/index');
var login = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Define Strategy, login
passport.use(authStrategy.strategy);
// Session serializing of the user
passport.serializeUser(authStrategy.serializeUser);
// Session deserialisation of the user
passport.deserializeUser(authStrategy.deserializeUser);
// required for passport: configuration
app.use(session({
  secret: 'ferropolyIsPlayedForTwoDecadesNow!',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: true}
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// Routes initialisation
login.init(app, settings);
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = require('http').Server(app);

app.set('port', settings.server.port);
app.set('ip', settings.server.host);
server.listen(app.get('port'), app.get('ip'), function () {
  console.log('%s: Node server started on %s:%d ...',
    new Date(Date.now()), app.get('ip'), app.get('port'));
});
console.log('Ferropoly Main server listening on port ' + app.get('port'));
