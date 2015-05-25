/**
 * Statistics API
 * Created by kc on 25.05.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var marketplaceApi = require('../lib/accounting/marketplace');
var teamAccount = require('../lib/accounting/teamAccount');

router.get('/rankingList/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId supplied'});s
  }
  teamAccount.getRankingList(req.params.gameId, function(err, ranking) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    res.send({status:'ok', ranking: ranking});
  });

});

module.exports = router;
