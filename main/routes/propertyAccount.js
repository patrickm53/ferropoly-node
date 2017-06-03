/**
 * Route for for property Account Issues
 * Created by kc on 27.05.15.
 */


const express         = require('express');
const router          = express.Router();
const propertyAccount = require('../lib/accounting/propertyAccount');
const gameCache       = require('../lib/gameCache');
const logger          = require('../../common/lib/logger').getLogger('routes:propertyAccount');
const accessor        = require('../lib/accessor');
const async           = require('async');
const propertyModel   = require('../../common/models/propertyModel');

/**
 * Get all acount Info for a team
 */
router.get('/getRentRegister/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId || !req.params.teamId) {
    return res.status(400).send({message: 'Missing parameters'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    }
    gameCache.getGameData(req.params.gameId, function (err, data) {
      if (err) {
        logger.error(err);
        return res.status(500).send({message: 'getGameData error: ' + err.message});
      }
      let gp   = data.gameplay;
      let team = data.teams[req.params.teamId];

      if (!gp || !team) {
        return res.send({status: 'error', message: 'Invalid params'});
      }

      propertyAccount.getRentRegister(gp, team, function (err, register) {
        if (err) {
          return res.status(500).send({message: 'getRentRegister error: ' + err.message});
        }
        res.send({register: register});
      });
    });
  });
});

/**
 * Get all acount Info for a team
 */
router.get('/getAccountStatement/:gameId/:propertyId', function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'Missing parameters'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    }
    if (req.params.propertyId === 'undefined') {
      req.params.propertyId = undefined;
    }

    propertyAccount.getAccountStatement(req.params.gameId, req.params.propertyId, function (err, register) {
      if (err) {
        return res.status(500).send({message: 'getAccountStatement error: ' + err.message});
      }
      res.send({register: register});
    });
  });
});

/**
 * Get profitability of all properties
 */
router.get('/propertyProfitability/:gameId/', function (req, res) {

  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    }

    propertyAccount.getPropertyProfitability(req.params.gameId, undefined, function (err, info) {
      if (err) {
        return res.status(500).send({message: 'getPropertyProfitability error: ' + err.message});
      }
      res.send({info: info});
    });
  });
});


/**
 * Get profitability of a teams property
 */
router.get('/propertyProfitability/:gameId/:teamId', function (req, res) {

  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    }

    // Get all properties for a team
    propertyModel.getPropertiesIdsForTeam(req.params.gameId, req.params.teamId, function (err, properties) {
      console.log(properties);
      if (err) {
        return res.status(500).send({message: 'getPropertiesIdsForTeam error: ' + err.message});
      }

      let info = [];
      async.each(properties,
        function (prop, cb) {
          propertyAccount.getPropertyProfitability(req.params.gameId, prop.uuid, function (err, profit) {
            if (err) {
              return cb(err);
            }
            info.push(profit);
            cb();
          });
        },
        function (err) {
          if (err) {
            return res.status(500).send({message: 'getPropertyProfitability error: ' + err.message});
          }
          res.send({info: info});
        });
    });
  });
});

module.exports = router;

