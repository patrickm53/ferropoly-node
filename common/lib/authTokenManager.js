/**
 * Token manager for the socket.io connection
 *
 * Created by kc on 10.05.15.
 */

const {v4: uuid} = require('uuid');
const mongoose   = require('mongoose');
const tokens     = {};
const logger     = require('../lib/logger').getLogger('authTokenManager');

const tokenSchema = mongoose.Schema({
  login     : String,
  id        : String,
  issueDate : {type: Date, default: Date.now},
  expiryDate: Date
});

const Token = mongoose.model('Token', tokenSchema);

async function getToken(user, callback) {
  let token, err;
  try {
    token = await Token
      .findOne()
      .where('login').equals(user)
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, token);
  }
}


module.exports = {
  /**
   * Generate a new token (or uses the proposed one)
   * @param options
   * @param callback
   */
  getNewToken: function (options, callback) {
    logger.debug(`New authtokenn requested for ${options.user} suggessting '${options.proposedToken}'`)
    getToken(options.user, async function (err, token) {
      if (err) {
        return callback(err);
      }
      if (!token) {
        token = new Token();
      }
      token.id    = options.proposedToken || uuid();
      token.login = options.user;
      let res, errInfo;
      try {
        res = await token.save();
        logger.debug(`User ${options.user} has now authtoken ${token.id}`);
      } catch (ex) {
        logger.error(ex);
        errInfo = ex;
      } finally {
        callback(errInfo, res.id);
      }
    }).then(() => {
    });
  },

  /**
   * Verifies a token
   * @param user
   * @param userToken
   * @param callback
   * @returns {*}
   */
  verifyToken: function (user, userToken, callback) {
    if (tokens[user]) {
      if (tokens[user].id === userToken) {
        return callback(null);
      }
    }
    getToken(user, function (err, token) {
      if (err) {
        return callback(err);
      }
      if (!token) {
        logger.info(`Not able to find an authtoken for '${user}'`);
        return callback(new Error('No token retrieved in verifyToken!'));
      }
      if (userToken === token.id) {
        tokens[user] = token;
        return callback(null);
      }
      logger.info(`Authtoken invalid, supplied '${userToken}' but got ${token.id} for ${user}`);
      callback(new Error('invalid token'));
    }).then(() => {
    });
  }
};
