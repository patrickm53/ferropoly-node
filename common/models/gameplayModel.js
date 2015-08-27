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

var mongoose = require('mongoose');
var crypto = require('crypto');
var uuid = require('node-uuid');
var Moniker = require('moniker');
var finalizedGameplays = [];
var moment = require('moment-timezone');
var logger = require('../lib/logger').getLogger('gameplayModel');

/**
 * The mongoose schema for an user
 */
var gameplaySchema = mongoose.Schema({
  _id: String,
  gamename: String, // name of the game
  owner: {
    organisatorName: String,
    organisation: String,
    organisatorEmail: String,
    organisatorPhone: String
  },
  scheduling: {
    gameDate: Date,
    gameStart: String, // hh:mm
    gameEnd: String, // hh:mm
    gameStartTs: Date, // Is set during finalization
    gameEndTs: Date // Is set during finalization
  },
  gameParams: {
    interestInterval: {type: Number, default: 60}, // Interval in minutes of the interests
    interest: {type: Number, default: 4000}, // "Startgeld"
    interestCyclesAtEndOfGame: {type: Number, default: 2}, // number of interests at end of game
    startCapital: {type: Number, default: 4000}, // "Startkapital"
    debtInterest: {type: Number, default: 20},    // fee on debts
    housePrices: {type: Number, default: .5},
    properties: {
      lowestPrice: {type: Number, default: 1000},
      highestPrice: {type: Number, default: 8000},
      numberOfPriceLevels: {type: Number, default: 8},
      numberOfPropertiesPerGroup: {type: Number, default: 2}
    },
    rentFactors: {
      noHouse: {type: Number, default: .125},
      oneHouse: {type: Number, default: .5},
      twoHouses: {type: Number, default: 2},
      threeHouses: {type: Number, default: 3},
      fourHouses: {type: Number, default: 4},
      hotel: {type: Number, default: 5},
      allPropertiesOfGroup: {type: Number, default: 2}
    },
    chancellery: {
      minLottery: {type: Number, default: 1000},  // amount to loose or win each call
      maxLottery: {type: Number, default: 5000},
      minGambling: {type: Number, default: 1000}, // amount to bet in the individual games
      maxGambling: {type: Number, default: 50000},
      maxJackpotSize: {type: Number, default: 500000}, // max jackpot size
      probabilityWin: {type:Number, default: 0.45},
      probabilityLoose: {type:Number, default: 0.45}
    }
  },
  internal: {
    gameId: {type: String, index: true}, // Identifier of the game
    owner: String,  // Owner of the game
    map: String,     // map to use
    finalized: {type: Boolean, default: false} // finalized means no edits anymore
  },
  log: {
    created: {type: Date, default: Date.now},
    lastEdited: {type: Date, default: Date.now},
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
var createGameplay = function (gpOptions, callback) {
  var gp = new Gameplay();
  if (!gpOptions.map || !gpOptions.ownerEmail || !gpOptions.name) {
    return callback(new Error('Missing parameter'));
  }

  gp.internal.map = gpOptions.map;
  gp.internal.owner = gpOptions.ownerEmail;
  gp.owner.organisatorEmail = gpOptions.ownerEmail;
  gp.owner.organisatorName = gpOptions.organisatorName;
  gp.scheduling.gameDate = gpOptions.gameDate;
  gp.scheduling.gameStart = gpOptions.gameStart;
  gp.scheduling.gameEnd = gpOptions.gameEnd;
  gp.gamename = gpOptions.name;
  gp.internal.gameId = gpOptions.gameId || Moniker.generator([Moniker.verb, Moniker.adjective, Moniker.noun]).choose();
  gp._id = gp.internal.gameId;

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
 * @param ownerEmail
 * @param callback
 */
var getGameplaysForUser = function (ownerEmail, callback) {
  Gameplay.find({'internal.owner': ownerEmail}, function (err, docs) {
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
var checkIfGameIdExists = function (gameId, callback) {
  Gameplay.count({'internal.gameId': gameId}, function (err, nb) {
    if (err) {
      return callback(err);
    }
    callback(null, nb > 0);
  });
};
/**
 * Counts the gameplays for a user
 * @param ownerEmail
 * @param callback
 */
var countGameplaysForUser = function (ownerEmail, callback) {
  Gameplay.count({'internal.owner': ownerEmail}, function (err, nb) {
    if (err) {
      return callback(err);
    }
    callback(null, nb);
  });
};

/**
 * Counts all gameplays for all users
 * @param ownerEmail
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
 * @param ownerEmail
 * @param callback
 */
var getGameplay = function (gameId, ownerEmail, callback) {
  var params = {'internal.owner': ownerEmail, 'internal.gameId': gameId};
  if (ownerEmail === null) {
    params = {'internal.gameId': gameId};
  }
  else if (ownerEmail === undefined) {
    return callback(new Error('undefined is not a valid value for ownerEmail'));
  }
  Gameplay.find(params, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback(new Error('This gameplay does not exist for this user:' + gameId + ' @ ' + ownerEmail));
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
    var e = time.split(':');
    var hour = e[0];
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
 * @param ownerEmail
 * @param callback
 */
var finalize = function (gameId, ownerEmail, callback) {
  getGameplay(gameId, ownerEmail, function (err, gp) {
    if (err) {
      callback(err);
    }
    if (gp.internal.finalized) {
      // nothing to do, is already finalized
      return callback(null, gp);
    }
    if (gp.owner.organisatorEmail !== ownerEmail) {
      return callback(new Error('Wrong user, not allowed to finalize'));
    }
    if (gp.log.priceListVersion === 0) {
      return callback(new Error('Can only finalize gameplays with pricelist'));
    }
    gp.internal.finalized = true;
    gp.scheduling.gameStartTs = finalizeTime(gp.scheduling.gameDate, gp.scheduling.gameStart);
    gp.scheduling.gameEndTs = finalizeTime(gp.scheduling.gameDate, gp.scheduling.gameEnd);

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
var isFinalized = function (gameId, callback) {
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
      loadedGp.gamename = gp.gamename;
      loadedGp.owner = gp.owner;
      loadedGp.scheduling = gp.scheduling;
      loadedGp.gameParams = gp.gameParams;
      loadedGp.log = gp.log;
      loadedGp.pricelist = gp.pricelist;
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
 * Just updates the gamplay 'last saved' field
 * @param ownerEmail
 * @param gameId
 * @param callback
 * @returns {*}
 */
var updateGameplayLastChangedField = function (ownerEmail, gameId, callback) {
  if (!gameId || !ownerEmail) {
    return callback(new Error('no gameplay name or email supplied'));
  }
  Gameplay.find({'internal.owner': ownerEmail, 'internal.gameId': gameId}, function (err, docs) {
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
    })
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

  Model: Gameplay,
  createGameplay: createGameplay,
  getGameplaysForUser: getGameplaysForUser,
  removeGameplay: removeGameplay,
  updateGameplay: updateGameplay,
  getGameplay: getGameplay,
  updateGameplayLastChangedField: updateGameplayLastChangedField,
  saveNewPriceListRevision: saveNewPriceListRevision,
  isFinalized: isFinalized,
  countGameplaysForUser: countGameplaysForUser,
  countGameplays: countGameplays,
  checkIfGameIdExists: checkIfGameIdExists,
  finalize: finalize,
  getAllGameplays: getAllGameplays
};
