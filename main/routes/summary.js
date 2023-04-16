/**
 * The summary of a game, all data is collected here and uploaded to the page
 * Created by kc on 27.04.16.
 */


const express = require('express');
const router  = express.Router();

const settings                    = require('../settings');
const gameplayModel               = require('../../common/models/gameplayModel');
const chancelleryTransactionModel = require('../../common/models/accounting/chancelleryTransaction');
const teamAccountTransactionModel = require('../../common/models/accounting/teamAccountTransaction');
const travelLogModel              = require('../../common/models/travelLogModel');
const propertyModel               = require('../../common/models/propertyModel');
const gameLogModel                = require('../../common/models/gameLogModel');
const pricelist                   = require('../../common/lib/pricelist');
const teamModel                   = require('../../common/models/teamModel');
const errorHandler                = require('../lib/errorHandler');
const logger                      = require('../../common/lib/logger').getLogger('routes:summary');
const summaryMailer               = require('../lib/summaryMailer');
const async                       = require('async');
const moment                      = require('moment');
const _                           = require('lodash');
const gameCache                   = require('../lib/gameCache');
const path                        = require('path');
const gamecache                   = require('../lib/gameCache');
const propWrap                    = require('../lib/propertyWrapper');
const teamAccount                 = require('../lib/accounting/teamAccount');
const collectAccountStatement     = require('../lib/accounting/collectAccountStatement');
const travelLog                   = require('../../common/models/travelLogModel');
const chancellery                 = require('../lib/accounting/chancelleryAccount');

let ngFile = '/js/summaryctrl.js';
if (settings.minifiedjs) {
  ngFile = '/js/min/summaryctrl.min.js';
}


/**
 * Send HTML Page
 */
router.get('/:gameId', function (req, res) {
  gameCache.getGameData(req.params.gameId, (err, gameData) => {
    if (err || !gameData) {
      return errorHandler(res, 'Spiel nicht gefunden.', err, 404);
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'summary.html'));
  });
});

router.get('/:gameId/static', function (req, res) {
  let gameId = req.params.gameId;

  gamecache.refreshCache(function (err) {
    if (err) {
      return res.status(404).send({message: 'Interner Fehler bei der Aktualisierung des Caches.'});
    }

    gamecache.getGameData(gameId, function (err, gamedata) {
      if (err) {
        return res.status(404).send({message: 'Spiel nicht gefunden.'});
      }
      let gp    = gamedata.gameplay;
      let teams = [];
      _.forOwn(gamedata.teams, t => {
        teams.push(_.omit(t, ['data.teamLeader.email', 'data.teamLeader.phone', 'data.remarks', 'data.members']));
      });

      if (!gp || !gamedata) {
        return res.status(401).send({message: 'Spiel nicht gefunden!'});
      }

      // Data is only returned after the game
      if (moment().isBefore(gp.scheduling.gameEndTs)) {
        return res.status(500).send({message: 'Die Spieldaten stehen erst nach dem Spiel zur Verfügung'});
      }

      // Yes, this is what you call the node.js callback hell... First we get all properties
      propWrap.getAllProperties(gameId, function (err, props) {
        if (err) {
          return res.status(500).send({message: 'getAllProperties error: ' + err.message});
        }
        for (let i = 0; i < props.length; i++) {
          props[i] = _.omit(props[i], ['_id', '__v', 'gameId']);
        }
        // Now we continue with the ranking list
        teamAccount.getRankingList(req.params.gameId, function (err, ranking) {
          if (err) {
            return res.status(500).send({message: err.message});
          }
          for (let i = 0; i < ranking.length; i++) {
            ranking[i] = _.omit(ranking[i], ['_id', '__v', 'gameId']);
          }
          // of course we want to add all account statements of all teams too
          collectAccountStatement(req, (err, accountStatement) => {
            if (err) {
              return res.status(500).send({message: err.message});
            }
            // now we get all travel log entries
            travelLog.getAllLogEntries(req.params.gameId, undefined, function (err, travelLog) {
              if (err) {
                return res.status(500).send({message: err.message});
              }
              for (let i = 0; i < travelLog.length; i++) {
                travelLog[i] = _.omit(travelLog[i], ['_id', '__v', 'gameId']);
              }
              // and the chancellery shall also not to be forgotten
              chancellery.getAccountStatement(req.params.gameId, function (err, chancellery) {
                if (err) {
                  return res.status(500).send({message: 'Chancellery getAccountStatement error: ' + err.message});
                }
                for (let i = 0; i < chancellery.length; i++) {
                  chancellery[i] = _.omit(chancellery[i], ['_id', '__v', 'gameId']);
                }

                res.send({
                  gameplay     : gp,
                  teams        : _.values(teams),
                  currentGameId: gameId,
                  mapApiKey    : settings.maps.apiKey,
                  properties   : props,
                  ranking,
                  accountStatement,
                  travelLog,
                  chancellery
                });
              });
            });
          });
        });
      });
    });
  });
});


/* GET home page. */
router.get('/old/:gameId', async function (req, res) {
  let gameId = req.params.gameId;
  let info   = {};

  info.teamTransactions = await teamAccountTransactionModel.getEntries(gameId, null, null, null);
  info.rankingList      = await teamAccountTransactionModel.getRankingList(gameId);
  info.chancellery      = await chancelleryTransactionModel.getEntries(gameId, null, null)

  async.waterfall(
    [
      function (cb) {
        gameplayModel.getGameplay(gameId, null, cb);
      },
      function (gp, cb) {
        info.gameplay = gp;
        pricelist.getPricelist(gameId, cb);
      },
      function (pl, cb) {
        info.pricelist = pl;
        teamModel.getTeams(gameId, (err, foundTeams) => {
          if (err) {
            return cb(err);
          }
          info.teams = [];
          for (let i = 0; i < foundTeams.length; i++) {
            info.teams.push({
              name          : foundTeams[i].data.name,
              organization  : foundTeams[i].data.organization,
              teamLeaderName: foundTeams[i].data.teamLeader.name,
              teamId        : foundTeams[i].uuid
            });
          }
          cb(null);
        });
      },
      function (cb) {
        travelLogModel.getLogEntries(gameId, null, null, null, cb);
      },
      function (log, cb) {
        info.travelLog = log;
        propertyModel.getPropertiesForGameplay(gameId, {lean: true}, cb);
      },
      function (properties, cb) {
        info.properties = properties;
        gameLogModel.getAllLogEntries(gameId, null, cb);
      },
      function (gameLog, cb) {
        info.gameLog = gameLog;
        cb();
      }
    ],
    function (err) {
      if (err) {
        logger.error(err);
        info = {error: err.message};
      } else if (moment(_.get(info, 'gameplay.scheduling.gameDate')).isSame(new Date(), 'day')) {
        info = {error: 'Die Spieldaten stehen ab Mitternacht zur Verfügung!'};
      }
      res.render('summary/summary', {
        title     : 'Ferropoly',
        ngFile    : '/js/summaryctrl.js',
        hideLogout: true,
        info      : JSON.stringify(info),
        mapApiKey : settings.maps.apiKey
      });
    }
  );
});

/**
 * Sends a mail to all teams with the summary (debug purposes only)
 * Looks something like this: localhost:3004/summary/game-id-here/sendmail?auth=demo
 */
router.post('/:gameId/sendmail', function (req, res) {
  let mailer = summaryMailer.getMailer();

  if (req.query.auth !== settings.debugSecret) {
    return res.status(403).send({message: 'Not allowed'});
  }

  mailer.sendInfo(req.params.gameId, (err, info) => {
    if (err) {
      return res.status(500).send({message: err.message});
    }
    res.status(200).send(info);
  })
});

module.exports = router;
