/**
 * The common login route: login into the website, redirect to login if not logged in
 *
 * Created by kc on 16.04.15.
 */


const express  = require('express');
const passport = require('passport');
const url      = require('url');
const router   = express.Router();
let settings;
const _        = require('lodash');
const logger   = require('../lib/logger').getLogger('login');
const path     = require('path');

/**
 * Get the login page
 */
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', '..', 'editor', 'public', 'html', 'login.html'));
});

/**
 * The login post route
 */
router.post('/', function (req, res) {
  logger.test(_.get(req, 'body.debug'));

  let redirectUri = req.session.targetUrl || '/';
  passport.authenticate('local', {
    successRedirect: redirectUri,
    failureRedirect: '/login',
    failureFlash   : true
  })(req, res);
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
      req.session.targetUrl = undefined;
      req.logout();
      res.redirect('/login');
    });
    app.post('/logout', function (req, res) {
      logger.test(_.get(req, 'body.debug'));
      req.session.targetUrl = undefined;
      req.logout();
      res.send({});
    });

    // Filter for get, redirect to login page if not logged out
    app.get('*', function (req, res, next) {
      let uri = url.parse(req.url).pathname;
      if (_.startsWith(uri, '/signup')) {
        logger.info('Signup !');
        return next();
      }
      if (_.endsWith(uri, 'jpg')) {
        return next();
      }
      if (_.endsWith(uri, 'ico')) {
        return next();
      }
      if (_.endsWith(uri, 'png')) {
        return next();
      }
      if (_.startsWith(uri, '/info')) {
        return next();
      }
      if (!req.session.passport || !req.session.passport.user) {
        // valid user in session
        if (uri === '/') {
          logger.info(uri + " redirected to login");
          res.redirect('/login');
        } else {
          logger.info(uri + " is not allowed (401)");
          req.session.targetUrl = req.url;
          res.status(401);

          res.render('error/401', {
            message: 'Zugriff nicht erlaubt',
            error  : {status: 401, stack: {}}
          });
        }

      } else {
        return next();
      }
    });
    settings = _settings;
  }
};

