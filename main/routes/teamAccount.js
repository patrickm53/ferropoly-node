/**
 * Route for the team accounts
 * Created by kc on 27.05.15.
 */
'use strict';


var express = require('express');
var router = express.Router();
var teamAccount = require('../lib/accounting/teamAccount');

router.get('/get/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});
  }
  if (req.params.teamId === 'undefined') {
    req.params.teamId = undefined;
  }

  teamAccount.getAccountStatement(req.params.gameId, req.params.teamId, function(err, data) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    res.send({status:'ok', accountData: data});
  });

});

module.exports = router;

