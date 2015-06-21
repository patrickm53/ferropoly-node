/**
 * This is the strategy used for the login into ferropoly
 *
 * THIS FILE IS MAINTAINED IN THE EDITOR PROJECT ONLY!!!!!!
 *
 * Created by kc on 17.01.15.
 */

var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var logger = require('./logger').getLogger('authStrategy');
var users;

/**
 * Create a hash
 * @param password
 * @returns {*}
 */
var createHash = function (password) {
  var shasum = crypto.createHash('sha256');
  shasum.update(password);
  return shasum.digest('hex');
};

/**
 * The "real" strategy
 * @type {LocalStrategy}
 */
var strategy = new LocalStrategy(
  function (username, password, done) {
    logger.info('Login attempt: ' + username);
    users.getUserByMailAddress(username, function (err, foundUser) {
      if (err || !foundUser) {
        return done(null, false);
      }

      if (users.verifyPassword(foundUser, password)) {
        foundUser.info.lastLogin = new Date();
        users.updateUser(foundUser, null, function() {
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
 * Serialize an user
 * @param user
 * @param done
 */
var serializeUser = function (user, done) {
  logger.info("serializeUser:" + user);
  done(null, user.personalData.email);
};

/**
 * deserialize an user
 * @param user
 * @param done
 * @returns {*}
 */
var deserializeUser = function (user, done) {
  logger.info("deserializeUser:" + user);
  return users.getUserByMailAddress(user, function (err, foundUser) {
    if (err || !foundUser) {
      return done("not logged in", null);
    }
    return done(null, foundUser);
  });
};

module.exports = {

  strategy: strategy,
  serializeUser: serializeUser,
  deserializeUser: deserializeUser,

  init: function (settings, _users) {
    users = _users;
  }
};
