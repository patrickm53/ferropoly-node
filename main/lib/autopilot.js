/**
 * The autopilot - generates automatically data for test games
 * Created by kc on 13.06.15.
 */


const _              = require('lodash');
const logger         = require('../../common/lib/logger').getLogger('autopilot');
const moment         = require('moment');
const gameCache      = require('./gameCache');
const travelLog      = require('../../common/models/travelLogModel');
const properties     = require('../../common/models/propertyModel');
const gameplays      = require('../../common/models/gameplayModel');
const picBucketModel = require('../../common/models/picBucketModel');
const marketplace    = require('./accounting/marketplace');
const {v4: uuid}     = require('uuid');
const {DateTime}     = require("luxon");
let picBucket        = undefined;
let autoPilotGames   = [];
let settings;

/**
 * Autoplay: called by the timer
 * @param gameplay is the gameplay
 */
function autoplay(gameplay) {
  try {
    gameCache.getGameData(gameplay.internal.gameId, function (err, data) {
      if (err) {
        logger.error(`${gameplay.internal.gameId}: getGameData error`, err);
        startTimer(gameplay);
        return;
      }
      let gp    = data.gameplay;
      let teams = _.values(data.teams);

      if (moment().isBefore(moment(gp.scheduling.gameStartTs))) {
        logger.info(`${gameplay.internal.gameId}: Game not started yet`);
        // Make sure that we do not poll to often, fall back to a 15-minute cycle
        startTimer(gameplay, (15 * 60 * 1000));
        return;
      }
      if (moment().isAfter(moment(gp.scheduling.gameEndTs))) {
        logger.info(`${gameplay.internal.gameId}: Game over, stopping autoplay`);
        return;
      }

      // Choose a team (random)
      if (!teams || teams.length === 0) {
        // happens only when the creation of the demo gameplay failed
        logger.info(`${gameplay.internal.gameId}: No team found in game, so stopping autoplay`);
        return;
      }
      let team = teams[_.random(0, teams.length - 1)];
      travelLog.getAllLogEntries(gp.internal.gameId, team.uuid, function (err, log) {
        if (err) {
          logger.error(`${gp.internal.gameId}: Error in getAllLogEntries`, err);
          startTimer(gameplay);
          return;
        }

        properties.getPropertiesForGameplay(gp.internal.gameId, {lean: true}, function (err, props) {
          if (err) {
            logger.error(`${gp.internal.gameId}: Error in getPropertiesForGameplay`, err);
            startTimer(gameplay);
            return;
          }
          playRound(gp.internal.gameId, team.uuid, log, props, function (err, info) {
            if (err) {
              logger.error(`${gp.internal.gameId}: Error in playRound`, err);
              startTimer(gameplay);
              return;
            }
            logger.debug(`${gameplay.internal.gameId}: Autoplay bought location`, info);
            startTimer(gameplay);
          });
        });
      });
    });
  } catch (exception) {
    logger.error(`Error in autoplay ${gameplay.internal.gameId}`, exception);
  }
}

/**
 * Creates a pic bucket entry
 * @param options
 * @param callback
 */
function createPicBucket(options, callback) {
  let pic      = new picBucketModel.Model();
  let seed     = uuid();
  const gameId = options.gameId;

  pic.gameId           = gameId;
  pic.teamId           = options.teamId;
  pic.filename         = options.filename || `${seed}.jpg`;
  pic.message          = _.get(options, 'message', undefined);
  pic.url              = `https://picsum.photos/seed/${seed}/1600/1200`;
  pic.thumbnail        = `https://picsum.photos/seed/${seed}/1600/1200`;
  pic.propertyId       = _.get(options, 'propertyId', undefined);
  pic.user             = _.get(options, 'user', 'unbekannt');
  pic.lastModifiedDate = DateTime.now();
  pic.position         = {
    lat     : Number(_.get(options, 'property.location.position.lat', '0')),
    lng     : Number(_.get(options, 'property.location.position.lng', '0')),
    accuracy: _.random(20, 800)
  };
  pic._id              = `${gameId}-${seed}`;
  picBucketModel
    .save(pic)
    .then(() => {
      picBucket.confirmUpload(pic._id, {doGeolocationApiCall: false}, callback);
    })
    .catch(callback)
}

/**
 * Play a round, we don't care about any errors here
 * @param gameId
 * @param teamId
 * @param travelLog
 * @param props
 * @param callback
 */
function playRound(gameId, teamId, travelLog, props, callback) {
  // play chancellery
  let mp = marketplace.getMarketplace();
  mp.chancellery(gameId, teamId, function () {
    mp.buildHouses(gameId, teamId, function () {
      let propertyId = selectClosestsProperty(travelLog, props);
      if (!propertyId) {
        logger.info(`${gameId}: Was not able to find closest property for team ${teamId}`);
        return callback();
      }
      mp.buyProperty({gameId: gameId, teamId: teamId, propertyId: propertyId}, err => {
        if (err) {
          return callback(err);
        }
        properties.getPropertyById(gameId, propertyId, (err, prop) => {
          if (err) {
            return callback(err);
          }
          createPicBucket({gameId: gameId, teamId: teamId, propertyId: propertyId, property: prop}, callback);
        })
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
  let a = Math.pow((origin.location.position.lat - target.location.position.lat), 2);
  let b = Math.pow((origin.location.position.lng - target.location.position.lng), 2);
  return Math.sqrt(a + b);
}

/**
 * Calculate the distances between one property and all others
 * @param originId
 * @param properties
 * @returns {*}
 */
function calculateDistances(originId, properties) {
  let result = [];
  let origin = _.find(properties, {'uuid': originId});
  if (!origin) {
    logger.info(originId + ' not found in properties');
    return [];
  }
  let i;
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
  let lastItem = _.findLast(travelLog, tl => {
    // consider only entries with a propertyID, the other ones are GPS tracks
    return tl.propertyId;
  });
  if (!lastItem) {
    // Only positions with GPS Locations, return a random one, don't care about the GPS coordinates,
    // this is only a demo!!
    return properties[_.random(0, properties.length - 1)].uuid;
  }

  let distances = calculateDistances(lastItem.propertyId, properties);
  let i         = 0;

  let closestPropertyId;
  let variant = _.random(0, 2);
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

/**
 * Starts the delay timer
 * @param gp Gameplay
 * @param delay
 */
function startTimer(gp, delay) {
  gp.timer = _.delay(() => {
    autoplay(gp);
  }, delay || gp.autopilotInterval);
}


/**
 * Refreshes the active games
 */
function refreshActiveGames() {
  // Stopp the current autopilots
  autoPilotGames.forEach(apg => {
    if (apg.timer) {
      logger.info(`${apg.internal.gameId}: Deleting autopilot`);
      clearTimeout(apg.timer);
    }
  });
  autoPilotGames = [];

  gameplays.getAutopilotGameplays()
           .then(gps => {
             if (!gps || gps.length === 0) {
               return logger.info('autopilot INACTIVE as there are no gameplays configured for it', gps);
             }
             picBucket = require('./picBucket')();
             gps.forEach(gp => {
               // Just a shortcut
               gp.autopilotInterval = _.get(gp, 'internal.autopilot.interval', (5 * 60 * 1000));
               logger.info(`${gp.internal.gameId}: Autopilot ACTIVE with ${gp.autopilotInterval / 1000}s interval`);
               startTimer(gp, _.random(gp.autopilotInterval / 2, gp.autopilotInterval));
               autoPilotGames.push(gp);
             })
           })
           .catch(err => {
             logger.error(err);
           })
}

module.exports = {
  /**
   * Initialize (always, autopilot is only started when configured)
   * @param options
   */
  init              : function (options) {
    // This is the over all settings: Release version of Ferropoly does not have an autopilot at all
    if (!options.autopilot) {
      logger.info('autopilot NOT CONFIGURED and therefore not active');
      return;
    }
    if (!options.autopilot.enabled) {
      logger.info('autopilot NOT ENABLED');
      return;
    }
    settings = options.autopilot;

    logger.info('autopilot ACTIVE');
    refreshActiveGames();
  },
  refreshActiveGames: refreshActiveGames
};
