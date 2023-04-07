/**
 * 'Gameplay' is adopted from 'screen play' and probably not the best name for this model. A gameplay has
 * all the information needed to play a game: price list (locations), groups, times and rules.
 *
 * The gameplay does not store the information of the game in its model, this is found in the GameEvents.
 *
 * !!!! THE SOURCE IS MAINTAINED IN THE FERROPOLY-EDITOR PROJECT !!!!
 *
 * Created by kc on 22.01.15.
 */

const mongoose = require('mongoose');
const Moniker  = require('moniker');
const _        = require('lodash');
const moment   = require('moment-timezone');
const logger   = require('../lib/logger').getLogger('gameplayModel');

const MOBILE_NONE  = 0;
const MOBILE_BASIC = 5;
const MOBILE_FULL  = 10;

let finalizedGameplays = [];

/**
 * The mongoose schema for an user
 */
const gameplaySchema = mongoose.Schema({
  _id       : {type: String, index: true},
  gamename  : String, // name of the game
  owner     : {
    organisatorName : String,
    organisation    : String,
    organisatorEmail: String,
    organisatorPhone: String
  },
  admins    : {
    logins: {type: Array, default: []}
  },
  scheduling: {
    gameDate   : Date,
    gameStart  : String, // hh:mm
    gameEnd    : String, // hh:mm
    gameStartTs: Date,   // Is set during finalization
    gameEndTs  : Date,   // Is set during finalization
    deleteTs   : Date    // Timestamp when the game is deleted
  },
  gameParams: {
    presets                  : {type: String, default: 'custom'},
    interestInterval         : {type: Number, default: 60},   // Interval in minutes of the interests
    interest                 : {type: Number, default: 4000}, // "Startgeld"
    interestCyclesAtEndOfGame: {type: Number, default: 2},    // number of interests at end of game
    startCapital             : {type: Number, default: 4000}, // "Startkapital"
    debtInterest             : {type: Number, default: 20},   // fee on debts
    housePrices              : {type: Number, default: .5},
    properties               : {
      lowestPrice               : {type: Number, default: 1000},
      highestPrice              : {type: Number, default: 8000},
      numberOfPriceLevels       : {type: Number, default: 8},
      numberOfPropertiesPerGroup: {type: Number, default: 2}
    },
    rentFactors              : {
      noHouse             : {type: Number, default: .125},
      oneHouse            : {type: Number, default: .5},
      twoHouses           : {type: Number, default: 2},
      threeHouses         : {type: Number, default: 3},
      fourHouses          : {type: Number, default: 4},
      hotel               : {type: Number, default: 5},
      allPropertiesOfGroup: {type: Number, default: 2}
    },
    chancellery              : {
      minLottery      : {type: Number, default: 1000},   // amount to loose or win each call
      maxLottery      : {type: Number, default: 5000},
      minGambling     : {type: Number, default: 1000},   // amount to bet in the individual games
      maxGambling     : {type: Number, default: 50000},
      maxJackpotSize  : {type: Number, default: 500000}, // max jackpot size
      probabilityWin  : {type: Number, default: 0.45},
      probabilityLoose: {type: Number, default: 0.45}
    }
  },
  mobile    : {
    level: {type: Number, default: MOBILE_NONE}
  },
  internal  : {
    gameId                 : {type: String, index: true},     // Identifier of the game
    owner                  : String,                          // Owner of the game. This is the ID of the user!
    map                    : String,                          // map to use
    finalized              : {type: Boolean, default: false}, // finalized means no edits anymore,
    priceListPendingChanges: {type: Boolean, default: false}, // Are there pending changes?
    creatingInstance       : String,                          // Instance creating this gameplay
    gameDataPublic         : {type: Boolean, default: false}, // After the game, the complete game is "public"
    isDemo                 : {type: Boolean, default: false}, // Demo games have some special behaviour
    autopilot              : {
      active   : {type: Boolean, default: false},             // Autopilot active
      picBucket: {type: Boolean, default: false},             // Generating pics for picbucket with autopilot
      interval : {type: Number, default: (5 * 60 * 1000)}     // Interval in ms between rounds
    }
  },
  joining   : {
    possibleUntil: {type: Date},
    infotext     : String,
    url          : String, // This is the URL for joining the game
  },
  rules     : {
    // The rules are currently part of the gameplay. In a next version, the rules are probably
    // a separate model with versioning (allowing to show old rules), but this has currently
    // no priority
    version  : {type: Number, default: -1},
    text     : String,
    changelog: {type: Array, default: []},
    date     : Date
  },
  log       : {
    created         : {type: Date, default: Date.now},
    lastEdited      : {type: Date, default: Date.now},
    priceListCreated: Date,
    priceListVersion: {type: Number, default: 0}
  }
}, {autoIndex: false});

/**
 * The Gameplay model
 */
const Gameplay = mongoose.model('Gameplay', gameplaySchema);

/**
 * Create a new gameplay and stores it immediately
 * @param gpOptions is an object with at least 'map', 'ownerEmail' and 'name'
 * @param callback
 */
let createGameplay      = function (gpOptions, callback) {
  let gp = new Gameplay();
  if (!gpOptions.map || !gpOptions.ownerEmail || !gpOptions.name) {
    return callback(new Error('Missing parameter'));
  }

  gp.internal.map              = gpOptions.map;
  gp.internal.owner            = gpOptions.ownerId || gpOptions.ownerEmail;
  gp.internal.isDemo           = gpOptions.isDemo || false;
  gp.owner.organisatorEmail    = gpOptions.ownerEmail;
  gp.owner.organisatorName     = gpOptions.organisatorName;
  gp.scheduling.gameDate       = gpOptions.gameDate;
  gp.scheduling.gameStart      = gpOptions.gameStart;
  gp.scheduling.gameEnd        = gpOptions.gameEnd;
  gp.scheduling.deleteTs       = moment(gpOptions.gameDate).add(30, 'd').hour(23).minute(59).toDate();
  gp.joining.possibleUntil     = gpOptions.joiningUntilDate || moment(gp.scheduling.gameDate).subtract(5, 'days').set('hour', 20).set('minute', 0).set('second', 0).toDate();
  gp.joining.infotext          = gpOptions.infoText;
  gp.gamename                  = gpOptions.name;
  gp.internal.gameId           = gpOptions.gameId || Moniker.generator([Moniker.adjective, Moniker.noun]).choose();
  gp.joining.url               = _.get(gpOptions, 'mainInstances[0]', 'https://spiel.ferropoly.ch') + '/anmelden/' + gp.internal.gameId;
  gp.internal.creatingInstance = gpOptions.instance;
  gp.mobile                    = gpOptions.mobile || {level: MOBILE_NONE};
  gp._id                       = gp.internal.gameId;

  gp.gameParams                  = _.assign(gp.gameParams, gpOptions.gameParams);
  gp.gameParams.interestInterval = gpOptions.interestInterval || gp.gameParams.interestInterval;

  checkIfGameIdExists(gp.internal.gameId, function (err, isExisting) {
    if (err) {
      return callback(err);
    }
    if (isExisting) {
      // generate new gameID
      gpOptions.gameId = Moniker.generator([Moniker.adjective, Moniker.noun]).choose();
      return createGameplay(gpOptions, callback);
    } else {
      gp.save(function (err, savedGp) {
        if (err) {
          return callback(err);
        }
        return callback(null, savedGp);
      });
    }
  });
};
/**
 * Get all gameplays associated for a user
 * @param email is an object with either id or email or both
 * @param callback
 */
let getGameplaysForUser = function (email, callback) {
  Gameplay.find({
    $or: [
      {'internal.owner': email},
      {'admins.logins': email}]
  }, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    callback(null, docs);
  });
};

/**
 * Checks if a game with a gameId exists.
 * @param gameId
 * @param callback
 */
let checkIfGameIdExists = function (gameId, callback) {
  Gameplay.countDocuments({'internal.gameId': gameId}, function (err, nb) {
    if (err) {
      return callback(err);
    }
    callback(null, nb > 0);
  });
};

/**
 * Creates a new GameID which is not used already (tested)
 * @param callback
 */
function createNewGameId(callback) {
  let gameId = Moniker.generator([Moniker.adjective, Moniker.noun]).choose();

  checkIfGameIdExists(gameId, function (err, isExisting) {
    if (err) {
      return callback(err);
    }
    if (isExisting) {
      // generate new gameID, recursive
      return createNewGameId(callback);
    }
    callback(null, gameId);
  });
}

/**
 * Counts the gameplays for a user
 * @param ownerId
 * @param callback
 */
let countGameplaysForUser = function (ownerId, callback) {
  Gameplay.countDocuments({'internal.owner': ownerId}, function (err, nb) {
    if (err) {
      return callback(err);
    }
    callback(null, nb);
  });
};

/**
 * Counts all gameplays for all users
 * @param callback
 */
let countGameplays = function (callback) {
  Gameplay.countDocuments({}, function (err, nb) {
    if (err) {
      return callback(err);
    }
    callback(null, nb);
  });
};

/**
 * Returns exactly one (or none, if not existing) gameplay with the params supplied
 * @param gameId
 * @param ownerId which is the email address of the person getting the data
 * @param callback
 */
let getGameplay = function (gameId, ownerId, callback) {
  let params = {$or: [{'internal.owner': ownerId}, {'admins.logins': ownerId}], 'internal.gameId': gameId};
  //  var params = {'internal.owner': ownerId, 'internal.gameId': gameId};
  if (ownerId === null) {
    params = {'internal.gameId': gameId};
  } else if (ownerId === undefined) {
    return callback(new Error('undefined is not a valid value for ownerId'));
  }
  Gameplay.find(params, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback(new Error('This gameplay does not exist for this user:' + gameId + ' @ ' + ownerId));
    }
    callback(null, docs[0]);
  });
};

/**
 * Returns all gameplays of all users. Of course only needed in the admin app
 * @param callback
 */
let getAllGameplays = function (callback) {
  Gameplay.find({}).lean().exec(function (err, docs) {
    if (err) {
      return callback(err);
    }
    callback(null, docs);
  });
};

/**
 * Remove a gameplay for ever (delete from DB)
 * @param gp gameplay object to remove
 * @param callback
 * @returns {*}
 */
let removeGameplay = function (gp, callback) {
  if (!gp || !gp.internal || !gp.internal.gameId) {
    return callback(new Error('Invalid gameplay'));
  }
  logger.info('Removing gameplay ' + gp.internal.gameId + ' (' + gp.gamename + ')');
  Gameplay.deleteMany({'internal.gameId': gp.internal.gameId}, function (err) {
    callback(err);
  });
};

/**
 * Finalize the time: add date and time together
 * @param date
 * @param time
 * @returns {Date}
 */
function finalizeTime(date, time) {
  try {
    let e      = time.split(':');
    let hour   = e[0];
    let minute = e[1];

    let newDate = moment.tz(date.getTime(), 'Europe/Zurich');
    newDate.minute(minute);
    newDate.hour(hour);
    newDate.second(0);
    return newDate.toDate();
  } catch (e) {
    logger.info('ERROR in finalizeTime: ' + e);
    return new Date();
  }
}

/**
 * Finalizes the gameplay, it can't be edited afterwards
 * @param gameId
 * @param ownerId
 * @param callback
 */
let finalize = function (gameId, ownerId, callback) {
  getGameplay(gameId, ownerId, function (err, gp) {
    if (err) {
      callback(err);
    }
    if (gp.internal.finalized) {
      // nothing to do, is already finalized
      return callback(null, gp);
    }
    if (gp.internal.owner !== ownerId) {
      return callback(new Error('Wrong user, not allowed to finalize'));
    }
    if (gp.log.priceListVersion === 0) {
      return callback(new Error('Can only finalize gameplays with pricelist'));
    }
    if (gp.internal.priceListPendingChanges) {
      return callback(new Error('Pricelist params changed, list not up to date!'));
    }
    gp.internal.finalized     = true;
    gp.scheduling.gameStartTs = finalizeTime(gp.scheduling.gameDate, gp.scheduling.gameStart);
    gp.scheduling.gameEndTs   = finalizeTime(gp.scheduling.gameDate, gp.scheduling.gameEnd);

    gp.save(function (err, gpSaved) {
      if (err) {
        return callback(err);
      }
      logger.info('Gameplay finalized: ' + gpSaved.internal.gameId);
      callback(null, gpSaved);
    });
  });
};

/**
 * Checks if a gameplay is finalized, caches the POSITIVE results
 * @param gameId
 * @param callback
 */
let isFinalized           = function (gameId, callback) {
  if (finalizedGameplays[gameId]) {
    // return cached value
    logger.info('return cached value');
    return true;
  }
  Gameplay.find({'internal.gameId': gameId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback(new Error('game not found: ' + gameId));
    }
    if (docs[0].internal.finalized) {
      finalizedGameplays[docs[0].internal.gameId] = true;
    }
    callback(null, docs[0].internal.finalized);
  });
};
/**
 * Updates a gameplay with partial data. GameId and Owner must be supplied
 * @param gp
 * @param callback
 */
let updateGameplayPartial = function (gp, callback) {
  getGameplay(gp.internal.gameId, gp.internal.owner, function (err, loadedGp) {
    if (err) {
      logger.info('Error while loading gameplay: ' + err.message);
      return callback(err);
    }
    let internal = loadedGp.internal;
    _.merge(loadedGp, gp);
    _.set(loadedGp, 'internal', internal);

    // Save in DB
    if (loadedGp.internal.finalized) {
      // We can't save it, it is finalized!
      return callback(new Error('already finalized'));
    }

    _.set(loadedGp, 'log.lastEdited', new Date());

    loadedGp.save(function (err, gpSaved, nbAffected) {
      if (err) {
        return callback(err);
      }
      logger.info('Gameplay update: ' + gpSaved.internal.gameId + ' #' + nbAffected);
      callback(null, gpSaved);
    });
  });
};
/**
 * Updates a gameplay
 * @param gp
 * @param callback
 */
let updateGameplay        = function (gp, callback) {
  gp.log.lastEdited = new Date();

  if (!gp.save) {
    // If this not a gameplay object, we have to load the existing game and update it
    logger.info('nod a gameplay, converting');
    return getGameplay(gp.internal.gameId, gp.internal.owner, function (err, loadedGp) {
      if (err) {
        logger.info('Error while loading gameplay: ' + err.message);
        return callback(err);
      }
      // we need to assign the data now to this gameplay loaded
      loadedGp.gamename   = gp.gamename;
      loadedGp.owner      = gp.owner;
      loadedGp.scheduling = gp.scheduling;
      loadedGp.gameParams = gp.gameParams;
      loadedGp.joining    = gp.joining;
      loadedGp.rules      = gp.rules;
      loadedGp.log        = gp.log;
      loadedGp.pricelist  = gp.pricelist;
      loadedGp.mobile     = gp.mobile;
      // we do not copy internal as this does not change (must not change!)

      // Call update again (this is recursive)
      return updateGameplay(loadedGp, function (err, gp2) {
        return callback(err, gp2);
      });
    });
  }
  // Save in DB
  if (gp.internal.finalized) {
    // We can't save it, it is finalized!
    return callback(new Error('already finalized'));
  }
  gp.save(function (err, gpSaved, nbAffected) {
    if (err) {
      return callback(err);
    }
    logger.info('Gameplay update: ' + gpSaved.internal.gameId + ' #' + nbAffected);
    callback(null, gpSaved);
  });
};

/**
 * Sets the admins of a gameplay. This has to work even when the gameplay was finalized before, that's why it is a
 * specific function and not done in updateGameplay()
 * @param gameId
 * @param ownerId
 * @param logins is an array with the entries to write
 * @param callback
 */
let setAdmins = function (gameId, ownerId, logins, callback) {
  getGameplay(gameId, ownerId, function (err, gameplay) {
    if (err) {
      return callback(err);
    }
    gameplay.log.lastEdited = new Date();
    gameplay.admins         = gameplay.admins || {};
    gameplay.admins.logins  = logins || [];
    gameplay.save(callback);
  });
};

/**
 * Sets the flag priceListPendingChanges to true: the price list can not be finalized without
 * being built before
 * @param gameId
 * @param ownerId
 * @param callback
 */
let invalidatePricelist = function (gameId, ownerId, callback) {
  getGameplay(gameId, ownerId, function (err, gameplay) {
    if (err) {
      return callback(err);
    }
    if (!gameplay.internal.priceListPendingChanges) {
      // Save only if the value was false before
      gameplay.internal.priceListPendingChanges = true;
      return gameplay.save(callback);
    }
    callback();
  });
};

/**
 * Just updates the gamplay 'last saved' field
 * @param ownerId
 * @param gameId
 * @param callback
 * @returns {*}
 */
let updateGameplayLastChangedField = function (ownerId, gameId, callback) {
  if (!gameId || !ownerId) {
    return callback(new Error('no gameplay name or email supplied'));
  }
  Gameplay.find({'internal.owner': ownerId, 'internal.gameId': gameId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback();
    }
    let gp = docs[0];
    if (gp.internal.finalized) {
      // We can't save it, it is finalized!
      return callback(new Error('already finalized'));
    }
    gp.log.lastEdited = new Date();
    gp.save(function (err) {
      return callback(err);
    });
  });
};

/**
 * Update the rules of a gameplay
 * @param gameId
 * @param ownerId
 * @param info
 * @param callback
 */
function updateRules(gameId, ownerId, info, callback) {
  if (!gameId || !ownerId) {
    return callback(new Error('no gameplay name or email supplied'));
  }
  Gameplay.find({'internal.owner': ownerId, 'internal.gameId': gameId}, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback(new Error(`Gameplay ${gameId} not found for user ${ownerId}`));
    }
    let gp = docs[0];

    if (!gp.rules || gp.rules.version < 0) {
      gp.rules = {
        version: 0, text: info.text, date: new Date(), changelog: []
      };
      gp.rules.changelog.push({
        ts     : new Date(),
        version: gp.rules.version,
        changes: 'Automatisch erstellte Grundversion'
      });
    } else {
      gp.rules.version++;
      gp.rules.text = info.text;
      gp.rules.changelog.push({ts: new Date(), version: gp.rules.version, changes: info.changes});
    }
    gp.save(function (err) {
      return callback(err);
    });
  });
}

/**
 * Saves a new revision of the pricelist: updates date and version
 * @param gameplay
 * @param callback
 */
let saveNewPriceListRevision = function (gameplay, callback) {
  if (gameplay.internal.finalized) {
    // We can't save it, it is finalized!
    return callback(new Error('already finalized'));
  }
  // This is the action which makes a price list valid
  gameplay.internal.priceListPendingChanges = false;
  gameplay.log.priceListCreated             = new Date();
  if (!gameplay.log.priceListVersion) {
    gameplay.log.priceListVersion = 1;
  } else {
    gameplay.log.priceListVersion++;
  }
  gameplay.save(function (err) {
    callback(err);
  });
};

/**
 * Returns all active autoilot games
 * @param callback
 */
let getAutopilotGameplays = function (callback) {
  Gameplay.find({'internal.isDemo': true, 'internal.autopilot.active': true}).lean().exec(callback);
}

/**
 * Exports of this module
 * @type {{init: Function, close: Function, Model: (*|Model), createGameplay: Function, getGameplaysForUser: Function, removeGameplay: Function, updateGameplay: Function, getGameplay: Function}}
 */
module.exports = {

  Model                         : Gameplay,
  createGameplay                : createGameplay,
  createNewGameId               : createNewGameId,
  getGameplaysForUser           : getGameplaysForUser,
  removeGameplay                : removeGameplay,
  updateGameplay                : updateGameplay,
  setAdmins                     : setAdmins,
  getGameplay                   : getGameplay,
  updateGameplayLastChangedField: updateGameplayLastChangedField,
  updateRules                   : updateRules,
  saveNewPriceListRevision      : saveNewPriceListRevision,
  isFinalized                   : isFinalized,
  countGameplaysForUser         : countGameplaysForUser,
  countGameplays                : countGameplays,
  checkIfGameIdExists           : checkIfGameIdExists,
  finalize                      : finalize,
  getAllGameplays               : getAllGameplays,
  invalidatePricelist           : invalidatePricelist,
  updateGameplayPartial         : updateGameplayPartial,
  getAutopilotGameplays         : getAutopilotGameplays,
  // Constants
  MOBILE_NONE : MOBILE_NONE,
  MOBILE_BASIC: MOBILE_BASIC,
  MOBILE_FULL : MOBILE_FULL

};
