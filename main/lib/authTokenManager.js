/**
 *
 * Created by kc on 10.05.15.
 */
'use strict';
var uuid = require('node-uuid');

var authTokens = {};

module.exports = {
  getNewToken: function(user) {
    authTokens[user] = uuid.v4();
    return authTokens[user];
  },

  verifyToken: function(user, token) {
    if (!authTokens[user]) {
      return false;
    }
    return authTokens[user] === token;
  }
};
