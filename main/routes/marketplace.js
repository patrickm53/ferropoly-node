/**
 * Routes for marketplace access
 * Created by kc on 25.05.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var marketplaceApi = require('../lib/accounting/marketplace');
var accessor = require('../lib/accessor');
/**
 * Build Houses
 */
router.post('/buildHouses/:gameId/:teamId', function (req, res) {
  var marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.send({status: 'error', message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.ferropolyToken) {
    return res.send({status: 'error', message: 'Permission denied (2)'});
  }
  marketplace.buildHouses(req.params.gameId, req.params.teamId, function (err, result) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    res.send({status: 'ok', result: result});
  });
});

/**
 * Buy Property
 */
router.post('/buyProperty/:gameId/:teamId/:propertyId', function (req, res) {
  var marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.send({status: 'error', message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.ferropolyToken) {
    return res.send({status: 'error', message: 'Permission denied (2)'});
  }
  marketplace.buyProperty(req.params.gameId, req.params.teamId, req.params.propertyId, function (err, result) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    res.send({status: 'ok', result: result});
  });
});

/**
 * Pay the rents and interests. This should not be called except an urgent case (or during development)
 */
router.get('/payRents/:gameId', function(req, res) {
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    var marketplace = marketplaceApi.getMarketplace();
    marketplace.payRents(req.params.gameId, function (err) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok'});
    });
  });
});
module.exports = router;
