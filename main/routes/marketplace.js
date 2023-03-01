/**
 * Routes for marketplace access
 * Created by kc on 25.05.15.
 */


const express        = require('express');
const router         = express.Router();
const marketplaceApi = require('../lib/accounting/marketplace');
const accessor       = require('../lib/accessor');
const _              = require("lodash");

/**
 * Build Houses
 */
router.post('/buildHouses/:gameId/:teamId', function (req, res) {
  let marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.status(403).send({message: 'No auth token'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.status(403).send({message: 'No access granted'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Verification Error, ' + err.message});
    }
    marketplace.buildHouses(req.params.gameId, req.params.teamId, function (err, result) {
      if (err) {
        return res.status(500).send({message: 'buildHouses error: ' + err.message});
      }
      res.send({result: result});
    });
  });
});

/**
 * Build a house on a specific property
 */
router.post('/buildHouse/:gameId/:teamId/:propertyId', function (req, res) {
  let marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.status(403).send({message: 'No auth token'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.status(403).send({message: 'No access granted'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Verification Error, ' + err.message});
    }
    marketplace.buildHouse(req.params.gameId, req.params.teamId, req.params.propertyId, function (err, result) {
      if (err) {
        return res.status(500).send({message: 'buildHouse error: ' + err.message});
      }
      res.send({result: result});
    });
  });
});


/**
 * Buy Property
 */
router.post('/buyProperty/:gameId/:teamId/:propertyId', function (req, res) {
  let marketplace = marketplaceApi.getMarketplace();
  if (!req.body.authToken) {
    return res.status(403).send({message: 'No auth token'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.status(403).send({message: 'No access granted'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Verification Error, ' + err.message});
    }
    marketplace.buyProperty({
      gameId    : req.params.gameId,
      teamId    : req.params.teamId,
      propertyId: req.params.propertyId,
      user      : user
    }, function (err, result) {
      if (err) {
        return res.status(500).send({message: 'buyProperty error: ' + err.message});
      }
      res.send({result: result});
    });
  });
});

/**
 * Pay the rents and interests. This should not be called except an urgent case (or during development)
 */
router.get('/payRents/:gameId', function (req, res) {
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Verification Error, ' + err.message});
    }
    let marketplace = marketplaceApi.getMarketplace();
    marketplace.payRents({gameId: req.params.gameId, user: user}, function (err) {
      if (err) {
        return res.status(500).send({message: 'payRents error: ' + err.message});
      }
      res.send({status: 'ok'});
    });
  });
});
module.exports = router;
