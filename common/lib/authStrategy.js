/**
 * This is the strategy used for the login into ferropoly
 *
 * THIS FILE IS MAINTAINED IN THE EDITOR PROJECT ONLY!!!!!!
 *
 * Created by kc on 17.01.15.
 */

const LocalStrategy    = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy   = require('passport-google-oauth20').Strategy;
const DropboxStrategy  = require('passport-dropbox-oauth2').Strategy;
const TwitterStrategy  = require('passport-twitter').Strategy;
const crypto           = require('crypto');
const logger           = require('./logger').getLogger('authStrategy');
const util             = require('util');

module.exports = function (settings, users) {

  /**
   * Serialize an user
   * @param user
   * @param done
   */
  function serializeUser(user, done) {
    logger.debug("serializeUser:" + user);
    done(null, user.personalData.email);
  }

  /**
   * deserialize an user
   * @param userId
   * @param done
   * @returns {*}
   */
  function deserializeUser(userId, done) {
    logger.debug("deserializeUser:" + userId);
    return users.getUserByMailAddress(userId, function (err, foundUser) {
      if (err || !foundUser) {
        return done(new Error("not logged in"), null);
      }
      return done(null, foundUser);
    });
  }

  /**
   * The local strategy for users registered in the ferropoly site
   * @type {LocalStrategy}
   */
  const localStrategy = new LocalStrategy(
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
        } else {
          logger.info('invalid password supplied for ' + foundUser);
          return done(null, false);
        }
      });
    }
  );

  /**
   * Facebook strategy for users using their facebook account
   */
  const facebookStrategy = new FacebookStrategy({
      clientID     : settings.oAuth.facebook.appId,
      clientSecret : settings.oAuth.facebook.secret,
      callbackURL  : settings.oAuth.facebook.callbackURL,
      enableProof  : false,
      profileFields: ['id', 'cover', 'picture', 'email', 'name']
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
  const googleStrategy = new GoogleStrategy({
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

  /**
   * Dropbox Strategy
   * Not applicable right now, not registered in dropbox
   */
  const dropboxStrategy = new DropboxStrategy({
      apiVersion       : '2',
      clientID         : settings.oAuth.dropbox.clientId,
      clientSecret     : settings.oAuth.dropbox.clientSecret,
      callbackURL      : settings.oAuth.dropbox.callbackURL,
      passReqToCallback: true
    },
    function (accessToken, refreshToken, donotknow, profile, done) {
      //console.log('accessToken', accessToken);
      //console.log('refreshToken', refreshToken);
      console.log('Dropbox Profile:', profile);

      users.findOrCreateDropboxUser(profile, function (err, foundUser) {
        return done(err, foundUser);
      });
    }
  );

  /**
   * Twitter strategy
   * They do not supply an email address when logging in. Breaks the code so far as the email address is the
   * key identification element in ferropoly. Don't use it therefore.
   */
  const twitterStrategy = new TwitterStrategy({
      consumerKey   : settings.oAuth.twitter.consumerKey,
      consumerSecret: settings.oAuth.twitter.consumerSecret,
      callbackURL   : settings.oAuth.twitter.callbackURL
    },
    function (token, tokenSecret, profile, cb) {
      users.findOrCreateTwitterUser(profile, function (err, user) {
        return cb(err, user);
      });
    });


  return {
    localStrategy   : localStrategy,
    facebookStrategy: facebookStrategy,
    googleStrategy  : googleStrategy,
    dropboxStrategy : dropboxStrategy,
    twitterStrategy : twitterStrategy,
    deserializeUser : deserializeUser,
    serializeUser   : serializeUser
  }
};
