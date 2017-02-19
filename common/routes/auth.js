/**
 * Auth Module for facebook and google
 * Created by kc on 26.12.15.
 */

var passport = require('passport');


module.exports = function (app) {
  /**
   * Authentication route for facebook
   */
  app.get('/auth/facebook',
    passport.authenticate('facebook', {scope: ['public_profile', 'email']}));

  /**
   * Callback for facebook
   */
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/login'}),
    function (req, res) {
      // Successful authentication, redirect home.
      console.log('SUCCESSFUL LOGGED IN WITH FACEBOOK ------------------------------------');
      res.redirect(req.session.targetUrl || '/');
    });

  /**
   * Authentication Route for Google
   */
  app.get('/auth/google',
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/plus.profile.emails.read'
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
   * Authentication Route for Windows Live
   */
  app.get('/auth/microsoft',
    passport.authenticate('windowslive', { scope: ['wl.signin', 'wl.emails'] }));

  /**
   * Callback for Windows Live
   */
  app.get('/auth/microsoft/callback',
    passport.authenticate('windowslive', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });
};


