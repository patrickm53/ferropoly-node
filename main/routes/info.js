/**
 * Page about game info, no login required
 *
 * Created by kc on 08.05.15.
 */
'use strict';


var express = require('express');
var router = express.Router();
var _ = require('lodash');

var gameplayModel = require('../../common/models/gameplayModel');
var pricelist = require('../../common/lib/pricelist');
var teamModel = require('../../common/models/teamModel');

/* GET home page. */
router.get('*', function (req, res) {
  var gameId = _.trimLeft(req.url, '/');

  gameplayModel.getGameplay(gameId, null, function (err, gp) {
    if (!gp) {
      gp = {};
    }
    var errMsg1 = '';
    if (err) {
      errMsg1 = err.message;
    }
    pricelist.getPricelist(gameId, function (err2, pl) {
      if (!pl) {
        pl = {};
      }
      var errMsg2 = '';
      if (err2) {
        errMsg2 = err2.message;
      }

      teamModel.getTeams(gameId, function (err3, foundTeams) {
        // Filter some info
        var teams = [];
        for (var i = 0; i < foundTeams.length; i++) {
          teams.push({
            name: foundTeams[i].data.name,
            organization: foundTeams[i].data.organization,
            teamLeaderName: foundTeams[i].data.teamLeader.name
          });
        }

        res.render('info', {
          title: 'Ferropoly',
          ngFile: '/js/infoctrl.js',
          hideLogout: true,
          err: errMsg1,
          err2: errMsg2,
          gameplay: JSON.stringify(gp),
          pricelist: JSON.stringify(pl),
          teams: JSON.stringify(teams)
        });
      });
    });
  });
});


module.exports = router;
