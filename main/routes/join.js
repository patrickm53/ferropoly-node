/**
 * Join a game
 * Created by kc on 05.02.16.
 */


const express   = require('express');
const router    = express.Router();
const gameCache = require('../lib/gameCache');
const settings  = require('../settings');
const users     = require('../../common/models/userModel');
const teams     = require('../../common/models/teamModel');
const logger    = require('../../common/lib/logger').getLogger('routes:join');
const mailer    = require('../../common/lib/mailer');
let ngFile      = '/js/joinctrl.js';
if (settings.minifiedjs) {
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

    let gameplay = {};
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
          let teamInfo = {};
          if (team) {
            teamInfo.name             = team.data.name;
            teamInfo.organization     = team.data.organization;
            teamInfo.phone            = team.data.teamLeader.phone;
            teamInfo.remarks          = team.data.remarks;
            teamInfo.confirmed        = team.data.confirmed;
            teamInfo.id               = team.id;
            teamInfo.registrationDate = team.data.registrationDate;
            teamInfo.changedDate      = team.data.changedDate;
          }
          res.render('join/join', {
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
            d.gameId                  = req.params.gameId;
            d.data                    = d.data || {};
            d.data.name               = req.body.teamName;
            d.data.organization       = req.body.organization;
            d.data.teamLeader         = {
              name : userInfo.personalData.forename + ' ' + userInfo.personalData.surname,
              email: userInfo.personalData.email,
              phone: req.body.phone
            };
            d.data.remarks            = req.body.remarks;
            d.data.onlineRegistration = true; // Game owner can't change email address
            d.data.changedDate        = new Date();
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
              sendInfoMail(gameData.gameplay, newTeam, {newTeam: true}, err => {
                if (err) {
                  logger.error(err);
                }
                res.status(200).send(newTeam);
              });
            });
            return;
          }

          // Existing team
          teams.updateTeam(setTeamData(team), (err, savedTeam) => {
            if (err) {
              return res.status(500).send(err.message);
            }
            logger.info(`Saved Team for ${req.params.gameId}: ${req.body.teamName} / ${savedTeam.uuid}`);
            sendInfoMail(gameData.gameplay, savedTeam, {newTeam: false}, err => {
              if (err) {
                logger.error(err);
              }
              res.status(200).send(savedTeam);
            });
          });
        });
      }
    );
  });
});


/**
 * Sends the signup mail
 * @param user
 * @param callback
 */
function sendInfoMail(gameplay, team, options, callback) {

  let html    = '';
  let text    = '';
  let subject = '';
  if (options.newTeam) {
    subject = 'Neue Ferropoly Anmeldung';
    html += '<h1>Neue Ferropoly Anmeldung</h1>';
    html += `<p>${team.data.teamLeader.name} meldet sich mit dem Team "${team.data.name}" für Dein Ferropoly "${gameplay.gamename}" an.</p>`;
    html += '<p>Bite bestätige diese Anmeldung in der Ferropoly Editor App.</p>';

    text += `${team.data.teamLeader.name} meldet sich mit dem Team "${team.data.name}" für Dein Ferropoly "${gameplay.gamename}" an.\n`;
    text += `Bite bestätige diese Anmeldung in der Ferropoly Editor App.\n`;
  }
  else {
    subject = 'Bearbeitete Ferropoly Anmeldung';
    html += '<h1>Bearbeitete Ferropoly Anmeldung</h1>';
    html += `<p>${team.data.teamLeader.name} hat die Anmeldung des Teams "${team.data.name}" für Dein Ferropoly "${gameplay.gamename}" bearbeitet.</p>`;
    html += '<p>Die Änderungen kannst Du in der Ferropoly Editor App anschauen.</p>';

    text += `${team.data.teamLeader.name} hat die Anmeldung des Teams "${team.data.name}" für Dein Ferropoly "${gameplay.gamename}" bearbeitet.\n`;
    text += 'Die Änderungen kannst Du in der Ferropoly Editor App anschauen.\n';
  }


  html += '<p></p>';
  html += '<p>Bitte auf dieses Mail nicht antworten, Mails an diese Adresse werden nicht gelesen. Infos und Kontakt zum Ferropoly:<a href="http://www.ferropoly.ch">www.ferropoly.ch</a></p>';
  text += 'Bitte auf dieses Mail nicht antworten, Mails an diese Adresse werden nicht gelesen. Infos und Kontakt zum Ferropoly: www.ferropoly.ch\n';

  logger.info('Mailtext created', text);
  mailer.send({
    to     : gameplay.owner.organisatorEmail,
    cc     : team.data.teamLeader.email,
    subject: subject,
    html   : html,
    text   : text
  }, callback);
}


module.exports = router;
