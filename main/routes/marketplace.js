/**
 * Routes for marketplace access
 * Created by kc on 25.05.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var marketplaceApi = require('../lib/accounting/marketplace')

/**
 * Build Houses
 */
router.post('/buildHouses', function (req, res) {
  var marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.send({status: 'error', message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.ferropolyToken) {
    return res.send({status: 'error', message: 'Permission denied (2)'});
  }
  marketplace.buildHouses(req.body.gameId, req.body.teamId, function (err, result) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    res.send({status: 'ok', result: result});
  });
});

/**
 * Buy Property
 */
router.post('/buyProperty', function (req, res) {
  var marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.send({status: 'error', message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.ferropolyToken) {
    return res.send({status: 'error', message: 'Permission denied (2)'});
  }
  marketplace.buyProperty(req.body.gameId, req.body.teamId, req.body.propertyId, function (err, result) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    res.send({status: 'ok', result: result});
  });
});

module.exports = router;
