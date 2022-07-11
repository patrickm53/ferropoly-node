/**
 * Authtoken: used for POST and socket.io, when we need to know that the user is really logged in
 * Created by kc on 29.01.15.
 */

const express          = require('express');
const router           = express.Router();
const logger           = require('../lib/logger').getLogger('authToken');
const authTokenManager = require('../lib/authTokenManager');
const _                = require('lodash');

/* GET the authtoken, which you only can get when logged in */
router.get('/', function (req, res) {
  authTokenManager.getNewToken({proposedToken: req.session.authToken}, (err, token) => {
    if (err) {
      logger.error(err);
      return res.status(500).send({authToken: 'none', message: 'Error while creating AuthToken'});
    }
    logger.info(`NEW auth token for ${req.session.passport.user}: was ${req.session.authToken}, becomes ${token}`);
    req.session.save(err => {
      if (err) {
        logger.error(err);
      }
      req.session.authToken = token;
      res.send({authToken: req.session.authToken, user: req.session.passport.user});
    });
  })
});

/**
 * A testing route for the auth tokens
 */
router.post('/test', function (req, res) {
  if (!req.body.authToken || req.body.authToken !== req.session.authToken) {
    logger.warn(`AUTH token test failed, ${req.body.authToken} vs ${req.session.authToken} for gameplay ${_.get(req, 'session.passport.user', 'UNKONWN')}`)
    return res.status(401).send({message: 'auth token mismatch'});
  }
  return res.status(200).send({message: 'ok'});
});

module.exports = {
  init: function (app) {
    app.use('/authtoken', router);
  }
};
