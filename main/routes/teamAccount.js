/**
 * Route for the team accounts
 * Created by kc on 27.05.15.
 */


const express                 = require('express');
const router                  = express.Router();
const accessor                = require('../lib/accessor');
const collectAccountStatement = require('../lib/accounting/collectAccountStatement');
const _                       = require("lodash");


router.get('/get/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  if (req.params.teamId === 'undefined' || req.params.teamId === 'all') {
    req.params.teamId = undefined;
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {

    if (err) {
      // This is not the admin. How abaout a player with valid TeamID?
      accessor.verifyPlayer(user, req.params.gameId, req.params.teamId, function (err) {
        if (err) {
          return res.status(401).send({message: err.message});
        }
        collectAccountStatement(req, (err, accountData) => {
          if (err) {
            return res.status(500).send({message: err.message});
          }
          res.send(accountData);
        });
      })
    } else {
      collectAccountStatement(req, (err, accountData) => {
        if (err) {
          return res.status(500).send({message: err.message});
        }
        res.send(accountData);
      });
    }
  });
});

module.exports = router;

