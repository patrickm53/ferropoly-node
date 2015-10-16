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

/**
 * Autoplay: called by the timer
 */
function autoplay() {
  try {
    gameCache.getGameData(settings.gameId, function (err, data) {
      if (err) {
        logger.error(err);
        startTimer();
        return;
      }
      var gp = data.gameplay;
      var teams = _.values(data.teams);

      if (moment().isBefore(moment(gp.scheduling.gameStartTs))) {
        logger.info('Game not started yet');
        // Make sure that we do not poll to often, fall back to a 15 minute cycle
        startTimer((15 * 60 * 1000));
        return;
      }
      if (moment().isAfter(moment(gp.scheduling.gameEndTs))) {
        logger.info('Game over, do nothing');
        // Make sure that we do not poll to often, fall back to a 15 minute cycle
        startTimer((15 * 60 * 1000));
        return;
      }

      // Choose a team (random)
      var team = teams[_.random(0, teams.length - 1)];
      travelLog.getAllLogEntries(settings.gameId, team.uuid, function (err, log) {
        if (err) {
          logger.error(err);
          startTimer();
          return;
        }

        properties.getPropertiesForGameplay(settings.gameId, {lean: true}, function (err, props) {
          if (err) {
            logger.error(err);
            startTimer();
            return;
          }
          playRound(settings.gameId, team.uuid, log, props, function () {
            startTimer();
          });
        });

      });
    });
  }
  catch (exception) {
    logger.error('Error in autoplay', exception);
  }
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
  mp.chancellery(gameId, teamId, function () {
    mp.buildHouses(gameId, teamId, function () {
      var propertyId = selectClosestsProperty(travelLog, properties);
      mp.buyProperty({gameId: gameId, teamId: teamId, propertyId: propertyId}, function () {
        callback();
      });
    });
  });
  // build houses
  // try to buy one property
}

/**
 * Calculate the distance between two loactions (direct way, just Pythagoras)
 * @param origin
 * @param target
 * @returns {number}
 */
function calculateDistance(origin, target) {
  var a = Math.pow((origin.location.position.lat - target.location.position.lat), 2);
  var b = Math.pow((origin.location.position.lng - target.location.position.lng), 2);
  return Math.sqrt(a + b);
}
/**
 * Calculate the distances between one property and all others
 * @param originId
 * @param properties
 * @returns {*}
 */
function calculateDistances(originId, properties) {
  var result = [];
  var origin = _.find(properties, {'uuid': originId});
  if (!origin) {
    logger.info(originId + ' not found in properties');
    return [];
  }
  var i;
  for (i = 0; i < properties.length; i++) {
    result.push({propertyId: properties[i].uuid, distance: calculateDistance(origin, properties[i])});
  }
  return _.sortBy(result, 'distance');
}
/**
 * Select the closest property (respectively one out of 3, to avoid taking all teams the same route)
 * @param travelLog
 * @param properties
 * @returns {*}
 */
function selectClosestsProperty(travelLog, properties) {
  if (travelLog.length === 0) {
    // First property, just start random
    return properties[_.random(0, properties.length - 1)].uuid;
  }
  var lastItem = _.last(travelLog);
  var distances = calculateDistances(lastItem.propertyId, properties);
  var i = 0;

  var closestPropertyId;
  var variant = _.random(0, 2);
  while (i < distances.length && !closestPropertyId) {
    if (!_.find(travelLog, {propertyId: distances[i].propertyId})) {
      if (variant === 0) {
        closestPropertyId = distances[i].propertyId;
      }
      variant--;
    }
    i++;
  }
  return closestPropertyId;
}
function startTimer(delay) {
  _.delay(autoplay, delay || settings.interval);
}


module.exports = {
  /**
   * Initialize (always, autopilot is only started when configured)
   * @param options
   */
  init: function (options) {
    if (!options.autopilot) {
      logger.info('autopilot NOT CONFIGURED');
      return;
    }
    if (!options.autopilot.active) {
      logger.info('autopilot NOT ACTIVE');
      return;
    }
    settings = options.autopilot;
    settings.interval = options.autopilot.interval || (5 * 60 * 1000);
    settings.gameId = 'play-a-demo-game';
    logger.info('autopilot ACTIVE');
    startTimer();
  }
};
