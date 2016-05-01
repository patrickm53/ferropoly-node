/**
 * AGB Handling
 * Created by kc on 01.05.16.
 */

const express   = require('express');
const router    = express.Router();
const session   = require('express-session');
const userModel = require('../models/userModel');
const logger    = require('../lib/logger').getLogger('agb');

const currentAgbVersion = 3; // Has to correlate with the ferropoly web page

/* GET if the user accepted the AGB or not */
router.get('/', function (req, res) {
  userModel.getUserByMailAddress(req.session.passport.user, function (err, user) {
    if (err) {
      logger.error('Error in agb', err);
      res.status(500);
      res.send('Fehler bei Abfrage: ' + err.message);
      return;
    }

    var info = {};
    if (!user.info.agbAccepted) {
      info.agbAccepted    = false;
      info.actionRequired = true;
    }
    else if (user.info.agbAccepted > 0 && user.info.agbAccepted < currentAgbVersion) {
      info.agbUpdated         = true;
      info.agbAcceptedVersion = user.info.agbAccepted;
      info.actionRequired     = true;
    }
    else {
      info.actionRequired = false;
    }
    info.currentAgbVersion = currentAgbVersion;
    res.send({success: true, info: info});
  });
});

// Accepting the AGB
router.post('/accept', function (req, res) {
  userModel.getUserByMailAddress(req.session.passport.user, function (err, user) {
    if (err) {
      logger.error('Error in agb', err);
      res.status(500);
      res.send('Fehler bei Abfrage: ' + err.message);
      return;
    }

    user.info.agbAccepted = currentAgbVersion;
    userModel.updateUser(user, null, function (err) {
      if (err) {
        logger.error('Error in agb update', err);
        res.status(500);
        res.send('Fehler bei Abfrage: ' + err.message);
        return;
      }

      res.send({success: true});
    });
  });
});

module.exports = router;
