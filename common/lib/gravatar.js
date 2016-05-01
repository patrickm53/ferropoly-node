/**
 * Gravatar
 * Created by kc on 30.12.15.
 */


var crypto = require('crypto');

module.exports = {
  getUrl: function (email) {
    var trimmed = email.trim().toLowerCase();
    return 'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(trimmed).digest("hex") + '?d=wavatar';
  }
};
