/**
 * The common login route: login into the website, redirect to login if not logged in
 *
 * Created by kc on 16.04.15.
 */
'use strict';


var express = require('express');
var passport = require('passport');
var url = require('url');
var router = express.Router();
var settings;
var _ = require('lodash');

router.get('/', function (req, res) {
  res.render('login', {
    title: settings.appName + ' Login',
    hideLogout: true,
    showSignUp: true,
    versionInfo: settings.version
  });
});


/**
 * The exports: an init function only
 * @type {{init: Function}}
 */
module.exports = {
  init: function (app, _settings) {

    // The login page
    app.use('/login', router);

    // Logging out
    app.get('/logout', function (req, res) {
      req.logout();
      res.redirect('/login');
    });

    // Filter for get, redirect to login page if not logged out
    app.get('*', function (req, res, next) {
      var uri = url.parse(req.url).pathname;
      if (uri === '/signup') {
        console.log('Signup !');
        return next();
      }
      if (uri === '/configuration.js') {
        return next();
      }
      if (_.endsWith(uri, 'jpg')) {
        return next();
      }
      if (_.endsWith(uri, 'ico')) {
        return next();
      }
      if (!req.session.passport.user) {
        // valid user in session
        console.log(uri + " redirected to login");
        res.redirect('/login');
      } else {
        return next();
      }
    });

    // Login post
    app.post('/login',
      passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
      })
    );

    settings = _settings;
  }
};

