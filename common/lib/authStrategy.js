/**
 * This is the strategy used for the login into ferropoly
 *
 * THIS FILE IS MAINTAINED IN THE EDITOR PROJECT ONLY!!!!!!
 *
 * Created by kc on 17.01.15.
 */

const LocalStrategy     = require('passport-local').Strategy;
const GoogleStrategy    = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const logger            = require('./logger').getLogger('authStrategy');

module.exports = function (settings, users) {

  /**
   * Serialize an user
   * @param user
   * @param done
   */
  function serializeUser(user, done) {
    logger.debug('serializeUser:' + user);
    done(null, user.personalData.email);
  }

  /**
   * deserialize an user
   * @param userId
   * @param done
   * @returns {*}
   */
  function deserializeUser(userId, done) {
    logger.debug('deserializeUser:' + userId);
    return users.getUserByMailAddress(userId, function (err, foundUser) {
      if (err || !foundUser) {
        return done(new Error('not logged in'), null);
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
   * Microsoft Strategy
   * Configured in https://portal.azure.com/
   */
  const microsoftStrategy = new MicrosoftStrategy({
      clientID    : settings.oAuth.microsoft.clientId,
      clientSecret: settings.oAuth.microsoft.clientSecret,
      callbackURL : settings.oAuth.microsoft.callbackURL,
      scope       : ['user.read']
    },

    function (accessToken, refreshToken, profile, done) {
      console.log('Microsoft Profile:', profile);

      users.findOrCreateMicrosoftUser(profile, function (err, foundUser) {
        return done(err, foundUser);
      });
    }
  );

  return {
    localStrategy    : localStrategy,
    googleStrategy   : googleStrategy,
    microsoftStrategy: microsoftStrategy,
    deserializeUser  : deserializeUser,
    serializeUser    : serializeUser
  };
};
