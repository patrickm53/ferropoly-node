/**
 * This is the strategy used for the login into ferropoly
 *
 * THIS FILE IS MAINTAINED IN THE EDITOR PROJECT ONLY!!!!!!
 *
 * Created by kc on 17.01.15.
 */

var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
var crypto           = require('crypto');
var logger           = require('./logger').getLogger('authStrategy');
var util             = require('util');

module.exports = function (settings, users) {

  /**
   * Serialize an user
   * @param user
   * @param done
   */
  var serializeUser = function (user, done) {
    logger.debug("serializeUser:" + user);
    done(null, user.personalData.email);
  };

  /**
   * deserialize an user
   * @param user
   * @param done
   * @returns {*}
   */
  var deserializeUser = function (userId, done) {
    logger.debug("deserializeUser:" + userId);
    return users.getUserByMailAddress(userId, function (err, foundUser) {
      if (err || !foundUser) {
        return done(new Error("not logged in"), null);
      }
      return done(null, foundUser);
    });
  };

  /**
   * The local strategy for users registered in the ferropoly site
   * @type {LocalStrategy}
   */
  var localStrategy = new LocalStrategy(
    function (username, password, done) {
      logger.info('Login attempt: ' + username);
      users.getUserByMailAddress(username, function (err, foundUser) {
        if (err || !foundUser) {
          return done(null, false);
        }

        if (users.verifyPassword(foundUser, password)) {
          foundUser.info.lastLogin = new Date();
          users.updateUser(foundUser, null, function () {
            return done(null, foundUser);
          });
        }
        else {
          logger.info('invalid password supplied for ' + foundUser);
          return done(null, false);
        }
      });
    }
  );

  /**
   * Facebook strategy for users using their facebook account
   */
  var facebookStrategy = new FacebookStrategy({
      clientID         : settings.oAuth.facebook.appId,
      clientSecret     : settings.oAuth.facebook.secret,
      callbackURL      : settings.oAuth.facebook.callbackURL,
      enableProof      : false,
      profileFields    : ['id', 'about', 'website', 'cover', 'picture', 'email', 'gender', 'name']
    },
    function (accessToken, refreshToken, profile, done) {
      //console.log('ACCESS-TOKEN  ' + util.inspect(accessToken));
      //console.log('REFRESH-TOKEN ' + util.inspect(refreshToken));
      console.log('FACEBOOK Profile:' + util.inspect(profile));
      users.findOrCreateFacebookUser(profile, function (err, user) {
        return done(err, user);
      });
    }
  );

  /**
   * Google Strategy
   */
  var googleStrategy = new GoogleStrategy({
      clientID         : settings.oAuth.google.clientId,
      clientSecret     : settings.oAuth.google.clientSecret,
      callbackURL      : settings.oAuth.google.callbackURL,
      passReqToCallback: true
    },
    function (accessToken, refreshToken, donotknow, profile, done) {
      //console.log('accessToken', accessToken);
      //console.log('refreshToken', refreshToken);
      console.log('GOOGLE Profile:', profile);

      users.findOrCreateGoogleUser(profile, function (err, foundUser) {
        return done(err, foundUser);
      });
    }
  );

  return {
    localStrategy   : localStrategy,
    facebookStrategy: facebookStrategy,
    googleStrategy  : googleStrategy,
    deserializeUser : deserializeUser,
    serializeUser   : serializeUser
  }
};
