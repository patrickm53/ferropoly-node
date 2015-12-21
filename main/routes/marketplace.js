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
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    marketplace.buildHouses(req.params.gameId, req.params.teamId, function (err, result) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok', result: result});
    });
  });
});

/**
 * Build a house on a specific property
 */
router.post('/buildHouse/:gameId/:teamId/:propertyId', function (req, res) {
  var marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.send({status: 'error', message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.ferropolyToken) {
    return res.send({status: 'error', message: 'Permission denied (2)'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    marketplace.buildHouse(req.params.gameId, req.params.teamId, req.params.propertyId, function (err, result) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok', result: result});
    });
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
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    marketplace.buyProperty({
      gameId: req.params.gameId,
      teamId: req.params.teamId,
      propertyId: req.params.propertyId,
      user: req.session.passport.user
    }, function (err, result) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok', result: result});
    });
  });
});

/**
 * Pay the rents and interests. This should not be called except an urgent case (or during development)
 */
router.get('/payRents/:gameId', function (req, res) {
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    var marketplace = marketplaceApi.getMarketplace();
    marketplace.payRents({gameId: req.params.gameId, user: req.session.passport.user}, function (err) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok'});
    });
  });
});
module.exports = router;
