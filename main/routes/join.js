/**
 * Join a game
 * Created by kc on 05.02.16.
 */


var express   = require('express');
var router    = express.Router();
var gameCache = require('../lib/gameCache');
var settings  = require('../settings');
var users     = require('../../common/models/userModel');
var teams     = require('../../common/models/teamModel');
var logger    = require('../../common/lib/logger').getLogger('routes:join');
var async     = require('async');
var ngFile    = '/js/joinctrl.js';
if (settings.minifedjs) {
  ngFile = '/js/joinctrl.min.js';
}


router.get('/:gameId', (req, res) => {
  gameCache.getGameData(req.params.gameId, (err, gameData) => {
    if (err) {
      return res.status(500).send({message: err.message});
    }
    if (!gameData) {
      return res.status(404).send({message: 'Game not found'});
    }

    var gameplay = {};
    if (gameData && gameData.gameplay) {
      gameplay = gameData.gameplay;
    }

    users.getUserByMailAddress(req.session.passport.user, (err, userInfo) => {
        if (err) {
          logger.error(err);
          return res.status(500).send(err.message);
        }
        if (!userInfo) {
          return res.status(404).send({message: 'User not found'});
        }
        teams.getMyTeam(req.params.gameId, req.session.passport.user, (err, team) => {
          if (err) {
            logger.error(err);
            return res.status(500).send(err.message);
          }
          var teamInfo = {};
          if (team) {
            teamInfo.name = team.data.name;
            teamInfo.organization = team.data.organization;
            teamInfo.phone = team.data.teamLeader.phone;
            teamInfo.remarks = team.data.remarks;
            teamInfo.confirmed = team.data.confirmed;
            teamInfo.id = team.id;
            teamInfo.registrationDate = team.data.registrationDate;
            teamInfo.changedDate = team.data.changedDate;
          }
          res.render('join', {
            title   : 'Ferropoly Spielauswertung',
            ngFile  : ngFile,
            gameplay: JSON.stringify(gameplay),
            user    : JSON.stringify({personalData: userInfo.personalData, id: userInfo._id}),
            team    : JSON.stringify(teamInfo)
          });
        });
      }
    );
  });
});

/**
 * Submit a request to join a game
 */
router.post('/:gameId', (req, res) => {
  if (!req.body.authToken) {
    return res.status(401).send({message: 'Permission denied, no authToken found'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.status(401).send({message: 'Permission denied, invalid authToken'});
  }
  gameCache.getGameData(req.params.gameId, (err, gameData) => {
    if (err) {
      logger.error(err);
      return res.status(500).send({message: err.message});
    }
    if (!gameData) {
      return res.status(404).send({message: 'Game not found'});
    }
    users.getUserByMailAddress(req.session.passport.user, (err, userInfo) => {
        if (err) {
          logger.error(err);
          return res.status(500).send(err.message);
        }
        if (!userInfo) {
          return res.status(404).send({message: 'User not found'});
        }

        teams.getMyTeam(req.params.gameId, req.session.passport.user, (err, team) => {
          if (err) {
            logger.error(err);
            return res.status(500).send(err.message);
          }

          // Sets the data according to the request
          function setTeamData(d) {
            d.gameId            = req.params.gameId;
            d.data              = d.data || {};
            d.data.name         = req.body.teamName;
            d.data.organization = req.body.organization;
            d.data.teamLeader   = {
              name : userInfo.personalData.forename + ' ' + userInfo.personalData.surname,
              email: userInfo.personalData.email,
              phone: req.body.phone
            };
            d.data.remarks      = req.body.remarks;
            d.data.changedDate  = new Date();
            return d;
          }

          if (!team) {
            // New team
            logger.info(`New Team for ${req.params.gameId}: ${req.body.teamName}`);
            teams.createTeam(setTeamData({
              data: {
                confirmed       : false,
                registrationDate: new Date()
              }
            }), req.params.gameId, (err, newTeam) => {
              if (err) {
                return res.status(500).send(err.message);
              }
              logger.info(`Saved Team for ${req.params.gameId}: ${req.body.teamName} / ${newTeam.uuid}`);
              res.status(200).send(newTeam);
            });
            return;
          }

          // Existing team
          teams.updateTeam(setTeamData(team), (err, savedTeam) => {
            if (err) {
              return res.status(500).send(err.message);
            }
            logger.info(`Saved Team for ${req.params.gameId}: ${req.body.teamName} / ${savedTeam.uuid}`);
            res.status(200).send(savedTeam);
          });
        });
      }
    );
  });
});

module.exports = router;
