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

const mongoose    = require('mongoose');
const Moniker     = require('moniker');
const _           = require('lodash');
const {DateTime}  = require("luxon");
const dateTimeLib = require('../lib/dateTimeLib');
const logger      = require('../lib/logger').getLogger('gameplayModel');

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
async function createGameplay(gpOptions, callback) {
  let errInfo;
  let gp = new Gameplay();
  if (!gpOptions.map || !gpOptions.ownerEmail || !gpOptions.name) {
    return callback(new Error('Missing parameter'));
  }
  try {
    gp.internal.map              = gpOptions.map;
    gp.internal.owner            = gpOptions.ownerId || gpOptions.ownerEmail;
    gp.internal.isDemo           = gpOptions.isDemo || false;
    gp.owner.organisatorEmail    = gpOptions.ownerEmail;
    gp.owner.organisatorName     = gpOptions.organisatorName;
    gp.scheduling.gameDate       = gpOptions.gameDate;
    gp.scheduling.gameStart      = gpOptions.gameStart;
    gp.scheduling.gameEnd        = gpOptions.gameEnd;
    gp.scheduling.deleteTs       = DateTime.fromJSDate(dateTimeLib.getJsDate(gpOptions.gameDate)).plus({days: 30}).set({
      hour  : 23,
      minute: 59
    }).toJSDate();
    gp.joining.possibleUntil     = gpOptions.joiningUntilDate || DateTime.fromJSDate(dateTimeLib.getJsDate(gp.scheduling.gameDate)).minus({days: 5}).set({
      hour  : 20,
      minute: 0,
      second: 0
    }).toJSDate();
    gp.joining.infotext          = gpOptions.infoText;
    gp.gamename                  = gpOptions.name;
    gp.internal.gameId           = gpOptions.gameId || Moniker.generator([Moniker.adjective, Moniker.noun]).choose();
    gp.joining.url               = _.get(gpOptions, 'mainInstances[0]', 'https://spiel.ferropoly.ch') + '/anmelden/' + gp.internal.gameId;
    gp.internal.creatingInstance = gpOptions.instance;
    gp.internal.autopilot        = gpOptions.autopilot;
    gp.mobile                    = gpOptions.mobile || {level: MOBILE_NONE};
    gp._id                       = gp.internal.gameId;

    gp.gameParams                  = _.assign(gp.gameParams, gpOptions.gameParams);
    gp.gameParams.interestInterval = gpOptions.interestInterval || gp.gameParams.interestInterval;

    await checkIfGameIdExists(gp.internal.gameId, async (err, isExisting) => {
      let result;
      try {
        if (isExisting) {
          // generate new gameID
          gpOptions.gameId = Moniker.generator([Moniker.adjective, Moniker.noun]).choose();
          return createGameplay(gpOptions, callback);
        } else {
          result = await gp.save();
          console.log(result);
        }
      } catch (ex) {
        logger.error(ex);
        errInfo = ex;
      } finally {
        callback(errInfo, result);
      }
    });
  } catch (ex) {
    logger.error(ex);
    return callback(ex);
  }
}

/**
 * Get all gameplays associated for a user
 * @param email is an object with either id or email or both
 * @param callback
 */
async function getGameplaysForUser(email, callback) {
  let err, docs;
  try {
    docs = await Gameplay
      .find({
        $or: [
          {'internal.owner': email},
          {'admins.logins': email}]
      })
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, docs);
  }
}

/**
 * Checks if a game with a gameId exists.
 * @param gameId
 * @param callback
 */
async function checkIfGameIdExists(gameId, callback) {
  let err;
  let res = false;
  try {
    let nb = await Gameplay
      .countDocuments({'internal.gameId': gameId})
      .exec();
    res    = nb > 0;
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}

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
  }).then(() => {
  });
}

/**
 * Counts the gameplays for a user
 * @param ownerId
 * @param callback
 */
async function countGameplaysForUser(ownerId, callback) {
  let err, nb;
  try {
    nb = await Gameplay
      .countDocuments({'internal.owner': ownerId})
      .exec()
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, nb);
  }
}

/**
 * Counts all gameplays for all users
 * @param callback
 */
async function countGameplays(callback) {
  let err, nb;
  try {
    nb = await Gameplay.countDocuments({}).exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, nb);
  }
}

/**
 * Returns exactly one (or none, if not existing) gameplay with the params supplied
 * @param gameId
 * @param ownerId which is the email address of the person getting the data
 * @param callback
 */
async function getGameplay(gameId, ownerId, callback) {
  let err, doc;
  try {
    let params = {$or: [{'internal.owner': ownerId}, {'admins.logins': ownerId}], 'internal.gameId': gameId};
    //  var params = {'internal.owner': ownerId, 'internal.gameId': gameId};
    if (ownerId === null) {
      params = {'internal.gameId': gameId};
    } else if (ownerId === undefined) {
      return callback(new Error('undefined is not a valid value for ownerId'));
    }
    const docs = await Gameplay
      .find(params)
      .exec();
    if (docs.length === 0) {
      err = new Error('This gameplay does not exist for this user:' + gameId + ' @ ' + ownerId);
    } else {
      doc = docs[0];
    }
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, doc);
  }
}

/**
 * Returns all gameplays of all users. Of course only needed in the admin app
 * @param callback
 */
async function getAllGameplays(callback) {
  let err, docs;
  try {
    docs = await Gameplay
      .find({})
      .lean()
      .exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, docs)
  }
}

/**
 * Remove a gameplay for ever (delete from DB)
 * @param gp gameplay object to remove
 * @param callback
 * @returns {*}
 */
async function removeGameplay(gp, callback) {
  let err;
  if (!gp || !gp.internal || !gp.internal.gameId) {
    return callback(new Error('Invalid gameplay'));
  }
  logger.info('Removing gameplay ' + gp.internal.gameId + ' (' + gp.gamename + ')');
  try {
    await Gameplay
      .deleteOne({'internal.gameId': gp.internal.gameId}).exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err);
  }
}

/**
 * Deletes all gameplays for a user, this is for internal and testing purposes only
 * @param email
 * @param callback
 * @returns {*}
 */
async function removeGameplaysForUser(email, callback) {
  let err;
  try {
    logger.info(`Removing Gameplays for ${email}`);
    await Gameplay
      .deleteMany({'owner.organisatorEmail': email}).exec();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err);
  }
}

/**
 * Finalize the time: add date and time together
 * @param date
 * @param time
 * @returns {Date}
 */
function finalizeTime(date, time) {
  try {
    let e       = time.split(':');
    let hour    = parseInt(e[0]);
    let minute  = parseInt(e[1]);
    let newDate = DateTime.fromJSDate(date);
    newDate     = newDate.set({minute: minute, hour: hour, second: 0});
    return newDate.toUTC().toJSDate();
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
async function finalize(gameId, ownerId, callback) {
  await getGameplay(gameId, ownerId, async function (err, gp) {
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
    let errInfo, gpSaved;
    try {
      gp.internal.finalized     = true;
      gp.scheduling.gameStartTs = finalizeTime(gp.scheduling.gameDate, gp.scheduling.gameStart);
      gp.scheduling.gameEndTs   = finalizeTime(gp.scheduling.gameDate, gp.scheduling.gameEnd);

      gpSaved = await gp.save();

      logger.info('Gameplay finalized: ' + gpSaved.internal.gameId);
    } catch (ex) {
      logger.error(ex);
      errInfo = ex;
    } finally {
      callback(errInfo, gpSaved);
    }
  });
}

/**
 * Checks if a gameplay is finalized, caches the POSITIVE results
 * @param gameId
 * @param callback
 */
async function isFinalized(gameId, callback) {
  if (finalizedGameplays[gameId]) {
    // return cached value
    logger.info('return cached value');
    return callback(null, true);
  }
  let err, res;
  try {
    const docs = await Gameplay.find({'internal.gameId': gameId});
    if (docs.length === 0) {
      err = new Error('game not found: ' + gameId);
    } else {
      if (docs[0].internal.finalized) {
        finalizedGameplays[docs[0].internal.gameId] = true;
      }
      res = docs[0].internal.finalized;
    }

  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, res);
  }
}


/**
 * Updates a gameplay with partial data. GameId and Owner must be supplied
 * @param gp
 * @param callback
 */
async function updateGameplayPartial(gp, callback) {

  getGameplay(gp.internal.gameId, gp.internal.owner, async function (err, loadedGp) {
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

    let errInfo, gpSaved;
    try {
      gpSaved = await loadedGp.save();
      logger.info('Gameplay update: ' + gpSaved.internal.gameId);
    } catch (ex) {
      logger.error(ex);
      errInfo = ex;
    } finally {
      callback(errInfo, gpSaved)
    }
  });
}

/**
 * Updates a gameplay
 * @param gp
 * @param callback
 */
async function updateGameplay(gp, callback) {

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

  let gpSaved, errInfo;
  try {
    gpSaved = await gp.save();
    logger.info('Gameplay update: ' + gpSaved.internal.gameId);
  } catch (ex) {
    logger.error(ex);
    errInfo = ex;
  } finally {
    callback(errInfo, gpSaved);
  }
}

/**
 * Sets the admins of a gameplay. This has to work even when the gameplay was finalized before, that's why it is a
 * specific function and not done in updateGameplay()
 * @param gameId
 * @param ownerId
 * @param logins is an array with the entries to write
 * @param callback
 */
async function setAdmins(gameId, ownerId, logins, callback) {
  await getGameplay(gameId, ownerId, async function (err, gameplay) {
    if (err) {
      return callback(err);
    }
    gameplay.log.lastEdited = new Date();
    gameplay.admins         = gameplay.admins || {};
    gameplay.admins.logins  = logins || [];

    let doc, errInfo;
    try {
      doc = await gameplay.save();
    } catch (ex) {
      logger.error(ex);
      errInfo = ex;
    } finally {
      callback(errInfo, doc);
    }
  });
}

/**
 * Sets the flag priceListPendingChanges to true: the price list can not be finalized without
 * being built before
 * @param gameId
 * @param ownerId
 * @param callback
 */
async function invalidatePricelist(gameId, ownerId, callback) {
  await getGameplay(gameId, ownerId, async function (err, gameplay) {
    if (err) {
      return callback(err);
    }
    if (!gameplay.internal.priceListPendingChanges) {
      // Save only if the value was false before
      gameplay.internal.priceListPendingChanges = true;

      let errInfo, doc;
      try {
        doc = await gameplay.save();
      } catch (ex) {
        logger.error(ex);
        errInfo = doc;
      } finally {
        callback(errInfo, doc);
      }
      return;
    }
    callback();
  });
}

/**
 * Just updates the gamplay 'last saved' field
 * @param ownerId
 * @param gameId
 * @param callback
 * @returns {*}
 */
async function updateGameplayLastChangedField(ownerId, gameId, callback) {
  if (!gameId || !ownerId) {
    return callback(new Error('no gameplay name or email supplied'));
  }

  let doc, err;
  try {
    const docs = await Gameplay
      .find({'internal.owner': ownerId, 'internal.gameId': gameId})
      .exec();

    if (docs.length === 0) {
      return callback();
    }
    let gp = docs[0];
    if (gp.internal.finalized) {
      // We can't save it, it is finalized!
      return callback(new Error('already finalized'));
    }
    gp.log.lastEdited = new Date();
    doc               = await gp.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, doc);
  }
}

/**
 * Update the rules of a gameplay
 * @param gameId
 * @param ownerId
 * @param info
 * @param callback
 */
async function updateRules(gameId, ownerId, info, callback) {
  let err;
  if (!gameId || !ownerId) {
    return callback(new Error('no gameplay name or email supplied'));
  }
  try {
    const docs = await Gameplay.find({'internal.owner': ownerId, 'internal.gameId': gameId}).exec();

    if (docs.length === 0) {
      err = new Error(`Gameplay ${gameId} not found for user ${ownerId}`);
      return;
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
    await gp.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err);
  }
}

/**
 * Saves a new revision of the pricelist: updates date and version
 * @param gameplay
 * @param callback
 */
async function saveNewPriceListRevision(gameplay, callback) {

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
  let updatedGp, err;
  try {
    updatedGp = await gameplay.save();
  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, updatedGp);
  }

}

/**
 * Returns all active autoilot games, only the ones today, only demo
 * @param callback
 */
async function getAutopilotGameplays(callback) {
  let err, gps;
  try {
    let today = DateTime.now().toISODate()
    gps       = await Gameplay
      .find({
        'internal.isDemo': true, 'internal.autopilot.active': true, 'scheduling.gameDate': {
          $gte: today, $lte: today
        }
      })
      .lean()
      .exec();

  } catch (ex) {
    logger.error(ex);
    err = ex;
  } finally {
    callback(err, gps);
  }
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
  removeGameplaysForUser        : removeGameplaysForUser,
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
