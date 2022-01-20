/**
 * Chancellery route
 * Created by kc on 28.05.15.
 */


const express     = require('express');
const router      = express.Router();
const chancellery = require('../lib/accounting/chancelleryAccount');
const gameCache   = require('../lib/gameCache');
const logger      = require('../../common/lib/logger').getLogger('routes:chancellery');
const accessor    = require('../lib/accessor');
const _           = require('lodash');

/**
 * Get the amount of the chancellery
 */
router.get('/balance/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    }
    chancellery.getBalance(req.params.gameId, function (err, data) {
      if (err) {
        return res.status(500).send({message: 'DB read error: ' + err.message});
      }
      res.send({data: data});
    });
  });
});

/**
 * Get all account entries of the chancellery
 */
router.get('/account/statement/:gameId', function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    }
    chancellery.getAccountStatement(req.params.gameId, function (err, data) {
      if (err) {
        return res.status(500).send({message: 'getAccountStatement error: ' + err.message});
      }
      res.send({entries: data});
    });
  });
});

/**
 * play chancellery
 */
router.get('/play/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId || !req.params.teamId) {
    return res.status(400).send({message: 'No gameId or teamId supplied'});
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

      chancellery.playChancellery(gp, team, function (err, data) {
        if (err) {
          return res.status(500).send({message: 'playChancellery error: ' + err.message});
        }
        res.send({result: data});
      });
    });
  });
});

/**
 * Gambling
 */
router.post('/gamble/:gameId/:teamId', function (req, res) {
  logger.info(req.body);
  if (!req.body.authToken) {
    return res.status(401).send({message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.status(401).send({message: 'Permission denied (2)'});
  }
  if (!req.params.gameId || !req.params.teamId || !req.body.amount) {
    return res.status(400).send({message: 'No gameId, teamId or amount supplied'});
  }

  accessor.verify(req.session.passport.user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      return res.status(500).send({message: err.message});
    }
    let amount = parseInt(req.body.amount);
    if (!_.isNumber(amount)) {
      return res.status(500).send({message: 'amount is not a number'});
    }
    gameCache.getGameData(req.params.gameId, function (err, data) {
      if (err) {
        logger.error(err);
        return res.status(500).send({message: err.message});
      }
      let gp   = data.gameplay;
      let team = data.teams[req.params.teamId];

      chancellery.gamble(gp, team, amount, function (err, data) {
        if (err) {
          return res.status(500).send({message: err.message});
        }
        res.send({result: data});
      });
    });
  });
});
module.exports = router;
