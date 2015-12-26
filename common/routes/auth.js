/**
 * Auth Module for facebook and google
 * Created by kc on 26.12.15.
 */

var passport = require('passport');


module.exports = function(app) {
  /**
   * Authentication route for facebook
   */
  app.get('/auth/facebook',
    passport.authenticate('facebook', {scope:['public_profile', 'email']}));

  /**
   * Callback for facebook
   */
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/login'}),
    function (req, res) {
      // Successful authentication, redirect home.
      console.log('SUCCESSFUL LOGGED IN ------------------------------------');
      res.redirect('/');
    });
};




