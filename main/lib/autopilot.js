/**
 * The autopilot - generates automatically data for test games
 * Created by kc on 13.06.15.
 */
'use strict';

var _ = require('lodash');
var logger = require('../../common/lib/logger').getLogger('autopilot');
var moment = require('moment');
var gameCache = require('./gameCache');
var travelLog = require('../../common/models/travelLogModel');
var properties = require('../../common/models/propertyModel');
var marketplace = require('./accounting/marketplace');
var settings;

function autoplay() {
  gameCache.getGameData(settings.gameId, function(err, data) {
    if (err) {
      logger.error(err);
      startTimer();
      return;
    }
    var gp = data.gameplay;
    var teams = _.values(data.teams);

    if (moment().isBefore(moment(gp.gamedata.scheduling.gameStartTs))) {
      logger.info('Game not started yet');
      // Make sure that we do not poll to often, fall back to a 15 minute cycle
      startTimer((15 * 60 * 1000));
      return;
    }
    if (moment().isAfter(moment(gp.gamedata.scheduling.gameEndTs))) {
      logger.info('Game over, do nothing');
      // Make sure that we do not poll to often, fall back to a 15 minute cycle
      startTimer((15 * 60 * 1000));
      return;
    }

    // Choose a team (random)
    var team = teams[_.random(0, teams.length)];
    travelLog.getAllLogEntries(settings.gameId, team.uuid, function(err, log) {
      if (err) {
        logger.error(err);
        startTimer();
        return;
      }

      properties.getPropertiesForGameplay(settings.gameId, {lean:true}, function(err, props) {
        if (err) {
          logger.error(err);
          startTimer();
          return;
        }
        playRound(settings.gameId, team.uuid, log, props, function() {
          startTimer();
        });
      });

    });
  });
}
/**
 * Play a round, we don't care about any errors here
 * @param gp
 * @param team
 * @param travelLog
 * @param properties
 * @param callback
 */
function playRound(gameId, teamId, travelLog, properties, callback) {
  // play chancellery
  var mp = marketplace.getMarketplace();
  mp.chancellery(gameId, teamId, function() {
    mp.buildHouses(gameId, teamId, function() {
      var propertyId = selectClosestsProperty(travelLog, properties);
      mp.buyProperty(gameId, teamId, propertyId, function() {
        callback();
      })
    });
  });
  // build houses
  // try to buy one property
}

function selectClosestsProperty(traveLog, properties) {
  return undefined;
}
function startTimer(delay) {
  _.delay(autoplay, delay || settings.interval);
}


module.exports = {
  init: function (options) {
    if (!options.autopilot) {
      logger.info('autopilot NOT ACTIVE');
      return;
    }
    settings = options.autopilot;
    settings.interval = options.autopilot.interval || (5 * 60 * 1000);
    settings.gameId = 'play-a-demo-game';

    startTimer();
  }
};
