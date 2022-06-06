/**
 * Authtoken: used for POST and socket.io, when we need to know that the user is really logged in
 * Created by kc on 29.01.15.
 */

const express          = require('express');
const router           = express.Router();
const logger           = require('../lib/logger').getLogger('authToken');
const authTokenManager = require('../lib/authTokenManager');

/* GET the authtoken, which you only can get when logged in */
router.get('/', function (req, res) {
  authTokenManager.getNewToken({proposedToken: req.session.authToken}, (err, token) => {
    if (err) {
      logger.error(err);
      return res.status(500).send({authToken: 'none', message: 'Error while creating AuthToken'});
    }
    logger.info(`NEW auth token for ${req.session.passport.user}: ${req.session.authToken}`);
    req.session.save(err => {
      if (err) {
        logger.error(err);
      }
      req.session.authToken = token;
      res.send({authToken: req.session.authToken, user: req.session.passport.user});
    });
  })
});


module.exports = {
  init: function (app) {
    app.use('/authtoken', router);
  }
};
