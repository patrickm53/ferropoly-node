/**
 * All about teams
 * Created by kc on 07.04.16.
 */


const express = require('express');
const router  = express.Router();

const settings     = require('../settings');
const errorHandler = require('../lib/errorHandler');
const teams        = require('../../common/models/teamModel');
const users        = require('../../common/models/userModel');
const _            = require('lodash');
const accessor     = require('../lib/accessor');
const async        = require('async');
let ngFile         = '/js/teamctrl.js';
if (settings.minifiedjs) {
  ngFile = '/js/min/teamctrl.min.js';
}

/* GET the page where the team leader can add / remove other team members. Make sure
 * that the user logged in is really the team leader
 */
router.get('/edit/:gameId/:teamId', (req, res) => {
  teams.getTeam(req.params.gameId, req.params.teamId, (err, team) => {
    if (err) {
      return errorHandler(res, 'Interner Fehler beim Laden des Users.', err, 500);
    }
    if (_.get(team, 'data.teamLeader.email', 'x') !== req.session.passport.user) {
      return errorHandler(res, 'Nicht berechtigt.', new Error('Not authorized or not found'), 404);
    }
    res.render('team', {
      title       : 'Teamverwaltung',
      ngController: 'teamCtrl',
      ngApp       : 'teamApp',
      gameId      : req.params.gameId,
      teamId      : req.params.teamId,
      ngFile      : ngFile
    });
  });
});

/**
 * Get the full member list, including all data needed for the teams member page
 * @param gameId
 * @param teamId
 * @param callback
 */
function getFullMemberList(gameId, teamId, callback) {
  var retVal = [];

  teams.getTeam(gameId, teamId, (err, team) => {
    var members = _.get(team, 'data.members', []);

    async.each(members,
      function (member, cb) {
        users.getUserByMailAddress(member, (err, user) => {
          if (err) {
            return cb(err);
          }
          if (user) {
            retVal.push({login: member, personalData: user.personalData});
          }
          else {
            retVal.push({login: member});
          }
          cb(null);
        });
      },
      function (err) {
        callback(err, retVal);
      }
    )
  });
}

/**
 * Get all team members
 */
router.get('/members/:gameId/:teamId', (req, res) => {
  accessor.verifyPlayer(req.session.passport.user, req.params.gameId, req.params.teamId, (err) => {
    if (err) {
      return errorHandler(res, 'Zugriff nicht möglich.', err, 404);
    }
    getFullMemberList(req.params.gameId, req.params.teamId, (err, info) => {
      if (err) {
        return errorHandler(res, 'Internes Problem .', err, 500);
      }
      res.send({members: info});
    });
  });
});

/**
 * Add a member and get all back in return
 */
router.post('/members/:gameId/:teamId', (req, res) => {
  if (!req.body.authToken) {
    return res.send({status: 'error', message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.send({status: 'error', message: 'Permission denied (2)'});
  }

  accessor.verifyPlayer(req.session.passport.user, req.params.gameId, req.params.teamId, (err) => {
    if (err) {
      return errorHandler(res, 'Zugriff nicht möglich.', err, 404);
    }
    teams.getTeam(req.params.gameId, req.params.teamId, (err, team) => {
      if (err) {
        return errorHandler(res, 'Internes Problem .', err, 500);
      }
      team.data.members = team.data.members || [];
      team.data.members.push(req.body.newMemberLogin);

      teams.updateTeam(team, (err) => {
        if (err) {
          return errorHandler(res, 'Internes Problem .', err, 500);
        }

        getFullMemberList(req.params.gameId, req.params.teamId, (err, info) => {
          if (err) {
            return errorHandler(res, 'Internes Problem .', err, 500);
          }
          res.send({members: info});
        });
      });
    });
  });
});

/**
 * removes a member and get all back in return
 */
router.delete('/members/:gameId/:teamId', (req, res) => {
  if (!req.body.authToken) {
    return res.send({status: 'error', message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.send({status: 'error', message: 'Permission denied (2)'});
  }

  teams.getTeam(req.params.gameId, req.params.teamId, (err, team) => {
    if (err) {
      return errorHandler(res, 'Internes Problem .', err, 500);
    }
    team.data.members = team.data.members || [];
    _.remove(team.data.members, (m) => { return m === req.body.memberToDelete; });

    teams.updateTeam(team, (err) => {
      if (err) {
        return errorHandler(res, 'Internes Problem .', err, 500);
      }

      getFullMemberList(req.params.gameId, req.params.teamId, (err, info) => {
        if (err) {
          return errorHandler(res, 'Internes Problem .', err, 500);
        }
        res.send({members: info});
      });
    });
  });
});

module.exports = router;
