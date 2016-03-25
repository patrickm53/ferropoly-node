/**
 * Route for for property Account Issues
 * Created by kc on 27.05.15.
 */



var express         = require('express');
var router          = express.Router();
var propertyAccount = require('../lib/accounting/propertyAccount');
var gameCache       = require('../lib/gameCache');
var logger          = require('../../common/lib/logger').getLogger('routes:propertyAccount');
var accessor        = require('../lib/accessor');
var async           = require('async');
var propertyModel   = require('../../common/models/propertyModel');

/**
 * Get all acount Info for a team
 */
router.get('/getRentRegister/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId || !req.params.teamId) {
    return res.send({status: 'error', message: 'No gameId/teamId supplied'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    gameCache.getGameData(req.params.gameId, function (err, data) {
      if (err) {
        logger.error(err);
        return res.send({status: 'error', message: err.message});
      }
      var gp   = data.gameplay;
      var team = data.teams[req.params.teamId];

      if (!gp || !team) {
        return res.send({status: 'error', message: 'Invalid params'});
      }

      propertyAccount.getRentRegister(gp, team, function (err, register) {
        if (err) {
          return res.send({status: 'error', message: err.message});
        }
        res.send({status: 'ok', register: register});
      });
    });
  });
});

/**
 * Get all acount Info for a team
 */
router.get('/getAccountStatement/:gameId/:propertyId', function (req, res) {
  if (!req.params.gameId) {
    return res.send({status: 'error', message: 'No gameId/teamId supplied'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }
    if (req.params.propertyId === 'undefined') {
      req.params.propertyId = undefined;
    }

    propertyAccount.getAccountStatement(req.params.gameId, req.params.propertyId, function (err, register) {
      if (err) {
        return res.send({status: 'error', message: err.message});
      }
      res.send({status: 'ok', register: register});
    });
  });
});

/**
 * Get profitability of all properties
 */
router.get('/propertyProfitability/:gameId/', function (req, res) {

  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }

    propertyAccount.getPropertyProfitability(req.params.gameId, undefined, function (err, info) {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      res.send({status: 'ok', info: info});
    });
  });
});


/**
 * Get profitability of a teams property
 */
router.get('/propertyProfitability/:gameId/:teamId', function (req, res) {

  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.send({status: 'error', message: err.message});
    }

    // Get all properties for a team
    propertyModel.getPropertiesIdsForTeam(req.params.gameId, req.params.teamId, function (err, properties) {
      console.log(properties);
      if (err) {
        return res.status(500).send({message: err.message});
      }

      var info = [];
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
            return res.status(500).send({message: err.message});
          }
          res.send({status: 'ok', info: info});
        });
    });
  });
});

module.exports = router;

