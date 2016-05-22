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

var mongoose           = require('mongoose');
var crypto             = require('crypto');
var uuid               = require('node-uuid');
var Moniker            = require('moniker');
var finalizedGameplays = [];
var moment             = require('moment-timezone');
var logger             = require('../lib/logger').getLogger('gameplayModel');

const MOBILE_NONE  = 0;
const MOBILE_BASIC = 5;
const MOBILE_FULL  = 10;

/**
 * The mongoose schema for an user
 */
var gameplaySchema = mongoose.Schema({
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
    gameId          : {type: String, index: true},     // Identifier of the game
    owner           : String,                          // Owner of the game. This is the ID of the user!
    map             : String,                          // map to use
    finalized       : {type: Boolean, default: false}, // finalized means no edits anymore,
    creatingInstance: String                           // Instance creating this gameplay
  },
  joining   : {
    possibleUntil: {type: Date},
    infotext     : String
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
var Gameplay = mongoose.model('Gameplay', gameplaySchema);

/**
 * Create a new gameplay and stores it immediately
 * @param gpOptions is an object with at least 'map', 'ownerEmail' and 'name'
 * @param callback
 */
var createGameplay      = function (gpOptions, callback) {
  var gp = new Gameplay();
  if (!gpOptions.map || !gpOptions.ownerEmail || !gpOptions.name) {
    return callback(new Error('Missing parameter'));
  }

  gp.internal.map                = gpOptions.map;
  gp.internal.owner              = gpOptions.ownerId || gpOptions.ownerEmail;
  gp.owner.organisatorEmail      = gpOptions.ownerEmail;
  gp.owner.organisatorName       = gpOptions.organisatorName;
  gp.scheduling.gameDate         = gpOptions.gameDate;
  gp.scheduling.gameStart        = gpOptions.gameStart;
  gp.scheduling.gameEnd          = gpOptions.gameEnd;
  gp.scheduling.deleteTs         = moment(gpOptions.gameDate).add(30, 'd').hour(23).minute(59).toDate();
  gp.gameParams.interestInterval = gpOptions.interestInterval || gp.gameParams.interestInterval;
  gp.joining.possibleUntil       = gpOptions.joiningUntilDate || moment(gp.scheduling.gameDate).subtract(5, 'days').set('hour', 20).set('minute', 0).set('second', 0).toDate();
  gp.joining.infotext            = gpOptions.infoText;
  gp.gamename                    = gpOptions.name;
  gp.internal.gameId             = gpOptions.gameId || Moniker.generator([Moniker.verb, Moniker.adjective, Moniker.noun]).choose();
  gp.internal.creatingInstance   = gpOptions.instance;
  gp.mobile                      = gpOptions.mobile || {level: MOBILE_NONE};
  gp._id                         = gp.internal.gameId;

  checkIfGameIdExists(gp.internal.gameId, function (err, isExisting) {
    if (err) {
      return callback(err);
    }
    if (isExisting) {
      // generate new gameID
      gpOptions.gameId = Moniker.generator([Moniker.verb, Moniker.adjective, Moniker.noun]).choose();
      return createGameplay(gpOptions, callback);
    }
    else {
      gp.save(function (err, savedGp) {
        if (err) {
          return callback(err);
        }
        return callback(null, savedGp);
      })
    }
  });
};
/**
 * Get all gameplays associated for a user
 * @param email is an object with either id or email or both
 * @param callback
 */
var getGameplaysForUser = function (email, callback) {
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
var checkIfGameIdExists   = function (gameId, callback) {
  Gameplay.count({'internal.gameId': gameId}, function (err, nb) {
    if (err) {
      return callback(err);
    }
    callback(null, nb > 0);
  });
};
/**
 * Counts the gameplays for a user
 * @param ownerId
 * @param callback
 */
var countGameplaysForUser = function (ownerId, callback) {
  Gameplay.count({'internal.owner': ownerId}, function (err, nb) {
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
var countGameplays = function (callback) {
  Gameplay.count({}, function (err, nb) {
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
var getGameplay = function (gameId, ownerId, callback) {
  var params = {$or: [{'internal.owner': ownerId}, {'admins.logins': ownerId}], 'internal.gameId': gameId};
  //  var params = {'internal.owner': ownerId, 'internal.gameId': gameId};
  if (ownerId === null) {
    params = {'internal.gameId': gameId};
  }
  else if (ownerId === undefined) {
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
var getAllGameplays = function (callback) {
  Gameplay.find({}).lean().exec(function (err, docs) {
    if (err) {
      return callback(err);
    }
    callback(null, docs);
  })
};

/**
 * Remove a gameplay for ever (delete from DB)
 * @param gp gameplay object to remove
 * @param callback
 * @returns {*}
 */
var removeGameplay = function (gp, callback) {
  if (!gp || !gp.internal || !gp.internal.gameId) {
    return callback(new Error('Invalid gameplay'));
  }
  logger.info('Removing gameplay ' + gp.internal.gameId + ' (' + gp.gamename + ')');
  Gameplay.remove({'internal.gameId': gp.internal.gameId}, function (err) {
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
    var e      = time.split(':');
    var hour   = e[0];
    var minute = e[1];

    var newDate = moment.tz(date.getTime(), 'Europe/Zurich');
    newDate.minute(minute);
    newDate.hour(hour);
    newDate.second(0);
    return newDate.toDate();
  }
  catch (e) {
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
var finalize = function (gameId, ownerId, callback) {
  getGameplay(gameId, ownerId, function (err, gp) {
    if (err) {
      callback(err);
    }
    if (gp.internal.finalized) {
      // nothing to do, is already finalized
      return callback(null, gp);
    }
    if (gp.owner.organisatorEmail !== ownerId) {
      return callback(new Error('Wrong user, not allowed to finalize'));
    }
    if (gp.log.priceListVersion === 0) {
      return callback(new Error('Can only finalize gameplays with pricelist'));
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
  })
};

/**
 * Checks if a gameplay is finalized, caches the POSITIVE results
 * @param gameId
 * @param callback
 */
var isFinalized    = function (gameId, callback) {
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
 * Updates a gameplay
 * @param gp
 * @param callback
 */
var updateGameplay = function (gp, callback) {
  gp.log.lastEdited = new Date();

  if (!gp.save) {
    // If this not a gameplay object, we have to load the existing game and update it
    logger.info('nod a gameplay, converting');
    return getGameplay(gp.internal.gameId, gp.internal.owner, function (err, loadedGp) {
      if (err) {
        logger.info('Error while loading gameplay: ' + err.message);
        return (err);
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
      })
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
var setAdmins = function (gameId, ownerId, logins, callback) {
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
 * Just updates the gamplay 'last saved' field
 * @param ownerId
 * @param gameId
 * @param callback
 * @returns {*}
 */
var updateGameplayLastChangedField = function (ownerId, gameId, callback) {
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
    var gp = docs[0];
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
    var gp = docs[0];

    if (!gp.rules || gp.rules.version < 0) {
      gp.rules = {
        version: 0, text: info.text, date: new Date(), changelog: []
      };
      gp.rules.changelog.push({ts: new Date(), version: gp.rules.version, changes: 'Automatisch erstellte Grundversion'});
    }
    else {
      gp.rules.version++;
      gp.rules.text = info.text;
      gp.rules.changelog.push({ts: new Date(), version: gp.rules.version, changes: info.changes});
    }
    gp.save(function (err) {
      return callback(err);
    });
  });
};

/**
 * Saves a new revision of the pricelist: updates date and version
 * @param gameplay
 * @param callback
 */
var saveNewPriceListRevision = function (gameplay, callback) {
  if (gameplay.internal.finalized) {
    // We can't save it, it is finalized!
    return callback(new Error('already finalized'));
  }
  gameplay.log.priceListCreated = new Date();
  if (!gameplay.log.priceListVersion) {
    gameplay.log.priceListVersion = 1;
  }
  else {
    gameplay.log.priceListVersion++;
  }
  gameplay.save(function (err) {
    callback(err);
  });
};

/**
 * Exports of this module
 * @type {{init: Function, close: Function, Model: (*|Model), createGameplay: Function, getGameplaysForUser: Function, removeGameplay: Function, updateGameplay: Function, getGameplay: Function}}
 */
module.exports = {

  Model                         : Gameplay,
  createGameplay                : createGameplay,
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
  // Constants
  MOBILE_NONE                   : MOBILE_NONE,
  MOBILE_BASIC                  : MOBILE_BASIC,
  MOBILE_FULL                   : MOBILE_FULL

};
