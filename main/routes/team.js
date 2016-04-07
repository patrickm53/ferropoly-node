/**
 * All about teams
 * Created by kc on 07.04.16.
 */


const express = require('express');
const router  = express.Router();

const settings     = require('../settings');
const errorHandler = require('../lib/errorHandler');
const teams        = require('../../common/models/teamModel');
const _            = require('lodash');
var ngFile         = '/js/teamctrl.js';
if (settings.minifiedjs) {
  ngFile = '/js/teamctrl.min.js';
}

/* GET the page where the team leader can add / remove other team members. Make sure
 * that the user logged in is really the team leader
 */
router.get('/members/:gameId/:teamId', function (req, res) {
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
      ngFile      : ngFile
    });
  });
});

module.exports = router;
