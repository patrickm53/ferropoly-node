/**
 * Auth Module for facebook and google
 * Created by kc on 26.12.15.
 */

const passport = require('passport');


module.exports = function (app) {
  /**
   * Authentication Route for Google
   */
  app.get('/auth/google',
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    }));

  /**
   * Callback for google
   */
  app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function (req, res) {
      // Successful authentication, redirect home.
      console.log('SUCCESSFUL LOGGED IN WITH GOOGLE ------------------------------------');
      res.redirect(req.session.targetUrl || '/');
    });

  /**
   * Authentication Route for Microsoft
   */
  app.get('/auth/microsoft',
    passport.authenticate('microsoft'));

  /**
   * Callback for google
   */
  app.get('/auth/microsoft/callback',
    passport.authenticate('microsoft', {failureRedirect: '/login'}),
    function (req, res) {
      // Successful authentication, redirect home.
      console.log('SUCCESSFUL LOGGED IN WITH MICROSOFT ------------------------------------');
      res.redirect(req.session.targetUrl || '/');
    });

};


