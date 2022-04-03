/**
 * Route for the team accounts
 * Created by kc on 27.05.15.
 */


const express     = require('express');
const router      = express.Router();
const teamAccount = require('../lib/accounting/teamAccount');
const _           = require('lodash');
const accessor    = require('../lib/accessor');
const moment      = require('moment');

router.get('/get/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  if (req.params.teamId === 'undefined' || req.params.teamId === 'all') {
    req.params.teamId = undefined;
  }

  /**
   * Internal function collecting the statement, either for one team or for all, depending on rights
   */
  function collectAccountStatement() {
    let teamBalance = {};
    let query       = req.query || {};
    let tsStart     = query.start ? moment(query.start) : undefined;
    let tsEnd       = query.end ? moment(query.end) : undefined;

    teamAccount.getAccountStatement(req.params.gameId, req.params.teamId, tsStart, tsEnd, function (err, data) {
      if (err) {
        return res.status(500).send({message: err.message});
      }

      for (let i = 0; i < data.length; i++) {

        if (!(tsStart || tsEnd)) {
          // The balance is only available if ALL data is requested. Otherwise it does not make sense!
          if (_.isUndefined(teamBalance[data[i].teamId])) {
            teamBalance[data[i].teamId] = 0;
          }
          teamBalance[data[i].teamId] += data[i].transaction.amount;
          data[i].balance = teamBalance[data[i].teamId];
        }

        //  data[i].transaction = _.omit(data[i].transaction, 'origin');
        data[i] = _.omit(data[i], ['gameId', '__v']);
      }
      res.send({accountData: data});
    });
  }

  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {

    if (err) {
      // This is not the admin. How abaout a player with valid TeamID?
      accessor.verifyPlayer(req.session.passport.user, req.params.gameId, req.params.teamId, function(err) {
        if (err) {
          return res.status(401).send({message: err.message});
        }
        return collectAccountStatement();
      })
    }
    else {
      collectAccountStatement();
    }
  });
});

module.exports = router;

