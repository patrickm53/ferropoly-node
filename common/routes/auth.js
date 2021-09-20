/**
 * Auth Module for facebook and google
 * Created by kc on 26.12.15.
 */

const passport = require('passport');


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

  /**
   * Authentication Route for Dropbox
   */
  app.get('/auth/dropbox',
    passport.authenticate('dropbox-oauth2'));

  /**
   * Callback for Dropbox
   */
  app.get('/auth/dropbox/callback',
    passport.authenticate('dropbox-oauth2', {failureRedirect: '/login'}),
    function (req, res) {
      // Successful authentication, redirect home.
      console.log('SUCCESSFUL LOGGED IN WITH DROPBOX ------------------------------------');
      res.redirect(req.session.targetUrl || '/');
    });

  /**
   * Authentication Route for Twitter
   */
  app.get('/auth/twitter',
    passport.authenticate('twitter'));

  /**
   * Callback for Twitter
   */
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {failureRedirect: '/login'}),
    function (req, res) {
      // Successful authentication, redirect home.
      console.log('SUCCESSFUL LOGGED IN WITH TWITTER ------------------------------------');
      res.redirect(req.session.targetUrl || '/');
    });

};


