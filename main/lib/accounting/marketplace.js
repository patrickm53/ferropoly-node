/**
 * All market actions are done over the marketplace
 *
 * Created by kc on 20.04.15.
 */
'use strict';
var gameCache = require('../gameCache');
var propWrap = require('../propertyWrapper');
var teamAccount = require('./teamAccount');
var propertyAccount = require('./propertyAccount');
var chancelleryAccount = require('./chancelleryAccount');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var logger = require('../../../common/lib/logger').getLogger('marketplace');
var travelLog = require('../../../common/models/travelLogModel');
var async = require('async');
var moment = require('moment');
var marketplace;

/**
 * Constructor
 * @param scheduler the instance of the gameScheduler, must be defined for the game, can be null for the integration tests
 * @constructor
 */
function Marketplace(scheduler) {
  var self = this;
  EventEmitter.call(this);

  this.scheduler = scheduler;

  if (this.scheduler) {
    /**
     * This is the 'interest' event launched by the gameScheduler
     */
    this.scheduler.on('interest', function (event) {
      logger.info('Marketplace: onInterest');
      self.payRents(event.gameId, function (err) {
        if (err) {
          logger.info('ERROR, interests not paid! Message: ' + err.message);
          event.callback(err);
          return;
        }
        logger.info('Timed interests paid');
        event.callback(null, event);
      });
    });
    /**
     * This is the 'start' event launched by the gameScheduler. Pay interests once.
     */
    this.scheduler.on('start', function (event) {
      logger.info('Marketplace: onStart');
      self.payInitialAsset(event.gameId, function (err) {
        if (err) {
          logger.info('ERROR, initial assets not paid! Message: ' + err.message);
          event.callback(err);
          return;
        }
        logger.info('Initial assets paid');
        event.callback(null, event);
      });
    });
    /**
     * This is the 'end' event launched by the gameScheduler. Pay the final rents & interests
     */
    this.scheduler.on('end', function (event) {
      logger.info('Marketplace: onEnd');
      self.payFinalRents(event.gameId, function (err) {
        if (err) {
          logger.info('ERROR, final interests not paid! Message: ' + err.message);
          event.callback(err);
          return;
        }
        logger.info('Timed interests paid');
        event.callback(null, event);
      });
    });
  }
}

util.inherits(Marketplace, EventEmitter);

/**
 * Determines whether the marketplace is open or not
 * @param gameplay
 * @param additionalMinutes give a tolerance at the end of the game (as we have to pay final rents)
 */
Marketplace.prototype.isOpen = function (gameplay, additionalMinutes) {
  additionalMinutes = additionalMinutes || 0;

  var start = moment(gameplay.scheduling.gameStartTs);
  var end = moment(gameplay.scheduling.gameEndTs).add({minutes: additionalMinutes});
  if (moment().isAfter(end)) {
    logger.info('Game over');
    return false;
  }
  if (moment().isBefore(start)) {
    logger.info('Game not started yet');
    return false;
  }
  return true;
};

/**
 * Buy a property or at least try to
 * 1) Success: property goes to the team, Money flow:
 *    team->property->bank
 * 2) Already sold: pay taxes, Money:
 *    team->property->owner
 *
 * @param gameId
 * @param teamId
 * @param propertyId
 * @param callback
 */
Marketplace.prototype.buyProperty = function (gameId, teamId, propertyId, callback) {
  var self = this;

  travelLog.addEntry(gameId, teamId, propertyId, function (err) {
    if (err) {
      logger.error(err);
    }
    // we do not care about this return, it's asynchronous and that's ok
  });

  logger.info('buyProperty :' + gameId + ' team: ' + teamId + ' property:' + propertyId);

  propWrap.getProperty(gameId, propertyId, function (err, property) {
    if (err) {
      return callback(err);
    }
    if (!property) {
      return callback(new Error('No property for this location'), {message: 'Dieses Ort kann nicht gekauft werden'});
    }
    gameCache.getGameData(gameId, function (err, res) {
      if (err) {
        logger.error(err);
        return callback(err);
      }
      var gp = res.gameplay;
      var team = res.teams[teamId];

      if (!gp || !team) {
        return callback(new Error('Gameplay error or team invalid'));
      }

      if (!self.isOpen(gp)) {
        return callback(new Error('Marketplace is closed'));
      }

      //------------------------------------------------------------------------------------------------------------------
      // Now check if the property is still available or sold. There are 3 cases to handle
      if (!property.gamedata || !property.gamedata.owner || property.gamedata.owner.length === 0) {
        // CASE 1: property is available, the team is going to buy it
        logger.info(property.location.name + ' is available');
        propertyAccount.buyProperty(gp, property, team, function (err, info) {
          if (err) {
            logger.error(err);
            return callback(err);
          }
          teamAccount.chargeToBank(teamId, gameId, info.amount, 'Kauf ' + property.location.name, function (err) {
            if (err) {
              return callback(err, {message: 'Fehler beim Grundstückkauf'});
            }
            // that's it!
            return callback(null, {property: property, amount: info.amount});
          });
        });
      }
      //------------------------------------------------------------------------------------------------------------------
      else if (property.gamedata.owner === teamId) {
        // CASE 2: property belongs to the team which wants to buy it, do nothing
        logger.info(property.location.name + ' already belongs the team');
        return callback(null, {property: property, amount: 0});
      }
      //------------------------------------------------------------------------------------------------------------------
      else {
        // CASE 3: property belongs to another team, pay the rent
        propertyAccount.getPropertyValue(gp, property, function (err, val) {
          if (err) {
            return callback(err);
          }
          teamAccount.chargeToAnotherTeam(gameId, teamId, property.gamedata.owner, val.amount, 'Miete ' + property.location.name, function (err, info) {
            logger.info(property.location.name + ' is already sold to another team');
            if (err) {
              logger.error(err);
              return callback(err);
            }
            return callback(null, {property: property, owner: property.gamedata.owner, amount: info.amount});
          });
        });
      }
    });
  });
};

/**
 * Build houses for all porperties of a team
 * Same money flow as buildHouse
 * @param gameId
 * @param teamId
 * @param callback
 */
Marketplace.prototype.buildHouses = function (gameId, teamId, callback) {
  var self = this;

  propWrap.getTeamProperties(gameId, teamId, function (err, properties) {
    if (err) {
      return callback(err);
    }

    if (properties.length === 0) {
      logger.info('nothing to build');
      return callback(null, {amount: 0, log: []});
    }

    gameCache.getGameData(gameId, function (err, res) {
      if (err) {
        logger.error(err);
        return callback(err);
      }
      var gp = res.gameplay;
      var team = res.teams[teamId];

      if (!gp || !team) {
        return callback(new Error('Gameplay error or team invalid'));
      }

      if (!self.isOpen(gp)) {
        return callback(new Error('Marketplace is closed'));
      }

      var log = [];
      var handled = 0;

      // Callback when buying building
      var buyBuildingCallback = function (err, info) {
        if (err) {
          logger.info(err);
        }
        else {
          log.push(info);
        }
        handled++;
        if (handled === properties.length) {
          var totalAmount = 0;
          for (var t = 0; t < log.length; t++) {
            totalAmount += log[t].amount;
          }
          if (totalAmount === 0) {
            // fine, we tried to build but there was nothing to build
            return callback(null, {amount: 0});
          }
          else {
            teamAccount.chargeToBank(teamId, gameId, totalAmount, {info: 'Hausbau', parts: log}, function (err) {
              if (err) {
                logger.error(err);
                return callback(err);
              }
              return callback(null, {amount: totalAmount, log: log});
            });
          }
        }
      };

      for (var i = 0; i < properties.length; i++) {
        propertyAccount.buyBuilding(gp, properties[i], team, buyBuildingCallback);
      }
    });
  });
};

/**
 * Pays the initial assets of a game
 * @param gameId
 * @param callback
 */
Marketplace.prototype.payInitialAsset = function (gameId, callback) {
  var self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var teams = _.valuesIn(res.teams);

    if (!self.isOpen(gp)) {
      return callback(new Error('Marketplace is closed'));
    }

    async.each(teams, function (team, callback) {
        teamAccount.receiveFromBank(team.uuid, gameId, gp.gameParams.startCapital, 'Startkapital', callback);
      },
      function (err) {
        callback(err);
      }
    );
  });
};

/**
 * Pays the final interests in a game. The number of them was defined in the editor.
 * @param gameId
 * @param callback
 */
Marketplace.prototype.payFinalRents = function (gameId, callback) {
  var self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var paid = 0;
    var error = null;
    if (gp.gameParams.interestCyclesAtEndOfGame < 1) {
      // No cycles, no interests, return
      return callback(null);
    }

    // give a tolerance of a few minutes for closing the market place
    if (!self.isOpen(gp, 3)) {
      return callback(new Error('Marketplace is closed'));
    }

    var payRentsCallback = function (err) {
      if (err) {
        error = err;
      }
      paid++;
      if (paid === gp.gameParams.interestCyclesAtEndOfGame) {
        callback(error);
      }
    };

    for (var i = 0; i < gp.gameParams.interestCyclesAtEndOfGame; i++) {
      self.payRents(gameId, payRentsCallback);
    }
  });
};

/**
 * Pay Interest (this is the fix value) for all teams.
 * Money: bank->team
 * @param callback
 */
Marketplace.prototype.payInterests = function (gameId, callback) {
  var self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var teams = _.valuesIn(res.teams);

    if (!self.isOpen(gp)) {
      return callback(new Error('Marketplace is closed'));
    }

    async.each(teams, function (team, callback) {
        teamAccount.payInterest(team.uuid, gameId, gp.gameParams.interest, callback);
      },
      function (err) {
        callback(err);
      }
    );
  });
};

/**
 * Checks for a negative asset and pays to the chancellery if so
 * @param gameId
 * @param callback
 */
Marketplace.prototype.checkNegativeAsset = function (gameId, callback) {
  var self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var teams = _.valuesIn(res.teams);

    if (!self.isOpen(gp)) {
      return callback(new Error('Marketplace is closed'));
    }

    async.each(teams, function (team, cb) {
      teamAccount.negativeBalanceHandling(gameId, team.uuid, gp.gameParams.debtInterest, function (err, info) {
        logger.info('negativeBalanceHandlingResult', info);
        if (err) {
          return cb(err);
        }
        if (info && info.amount !== 0) {
          chancelleryAccount.payToChancellery(gp, team, info.amount, 'Strafzins (negatives Guthaben)', cb);
          return;
        }
        cb();
      })
    }, function (err) {
      callback(err);
    });
  });
};

/**
 * Pays the rents (each hour) for a team
 * @param gp
 * @param team
 * @param callback
 */
Marketplace.prototype.payRentsForTeam = function (gp, team, callback) {

  if (!this.isOpen(gp)) {
    return callback(new Error('Marketplace is closed'));
  }

  propertyAccount.getRentRegister(gp, team, function (err, info) {
    if (err) {
      logger.info(err);
      return callback(err);
    }
    propertyAccount.payInterest(gp, info.register, function (err) {
      if (err) {
        logger.info(err);
        return callback(err);
      }
      if (info.totalAmount > 0) {
        teamAccount.receiveFromBank(info.teamId, gp.internal.gameId, info.totalAmount, {
          info: 'Grundstückzins',
          parts: info.register
        }, function (err) {
          return callback(err);
        });
      }
      else {
        return callback(err);
      }
    });
  });
};

/**
 * Pays the rents (interests and rents) for all teams, also releasing the buildingEnabled lock for the next round
 * If the team has debts, a percentage of it will be payed too.
 *
 * Money: bank->propertIES->team
 * @param gameId
 * @param callback
 */
Marketplace.prototype.payRents = function (gameId, callback) {
  var self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var teams = _.valuesIn(res.teams);

    if (!gp) {
      return callback(new Error('Gameplay with id ' + gameId + ' not found (payRents)'));
    }

    if (!self.isOpen(gp)) {
      return callback(new Error('Marketplace is closed'));
    }

    // check negative asset and pay rent
    self.checkNegativeAsset(gameId, function (err) {
      if (err) {
        return callback(err);
      }

      self.payInterests(gameId, function (err) {
        if (err) {
          return callback(err);
        }

        propWrap.allowBuilding(gameId, function (err, nbAffected) {
          if (err) {
            return callback(err);
          }
          logger.info('Building allowed again for ' + nbAffected.toString() + ' buildings');

          async.each(teams, function (team, callback) {
              self.payRentsForTeam(gp, team, callback);
            },
            function (err) {
              callback(err);
            }
          );
        });
      });
    });
  });
};

/**
 * Chancellery, every time a team calls (be sure that they are on the line,
 * no false alarms: only call the function when really editing the team).
 *
 * You can loose or win a random amount or you can even win the jackpot
 *
 * Money: team->chancellery   (negative amount)
 *        bank->team          (positive amount)
 *
 * @param gameId
 * @param teamId
 * @param callback
 */
Marketplace.prototype.chancellery = function (gameId, teamId, callback) {
  var self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var team = res.teams[teamId];

    if (!self.isOpen(gp)) {
      return callback(new Error('Marketplace is closed'));
    }

    chancelleryAccount.playChancellery(gp, team, function (err, res) {
      callback(err, res);
    });
  });
};

/**
 * Chancellery Game: either you win or you loose. Usually only loosing money
 * is taken into account, rising the value of the chancellery
 *
 * Money: team->chancellery   (negative amount)
 *        bank->team          (positive amount)
 *
 * @param gameId
 * @param teamId
 * @param amount
 * @param callback
 */
Marketplace.prototype.chancelleryGamble = function (gameId, teamId, amount, callback) {
  var self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var team = res.teams[teamId];

    if (!self.isOpen(gp)) {
      return callback(new Error('Marketplace is closed'));
    }

    chancelleryAccount.gamble(gp, team, amount, function (err, res) {
      callback(err, res);
    });
  });
};


/**
 * A very exceptional case, but might be needed: increasing or decreasing
 * the account of a team due to an error, penalty or what so ever
 *
 * @param gameId
 * @param teamId
 * @param amount
 * @param reason
 * @param callback
 */
Marketplace.prototype.manipulateTeamAccount = function (gameId, teamId, amount, reason, callback) {
  if (!reason) {
    return callback(new Error('reason must be supplied'));
  }

  if (amount > 0) {
    teamAccount.receiveFromBank(teamId, gameId, amount, 'Manuelle Gutschrift: ' + reason, function (err) {
      callback(err);
    });
  }
  else {
    teamAccount.chargeToBank(teamId, gameId, amount, 'Manuelle Lastschrift: ' + reason, function (err) {
      callback(err);
    });

  }
};

/**
 * Resets a property: removes the owner and buildings. Use only, if you have bought a property by mistake
 * for a team. The affected teams account is not touched.
 *
 * @param gameId
 * @param propertyId
 * @param reason
 * @param callback
 * @returns {*}
 */
Marketplace.prototype.resetProperty = function (gameId, propertyId, reason, callback) {
  if (!reason) {
    return callback(new Error('reason must be supplied'));
  }

  propWrap.getProperty(gameId, propertyId, function (err, prop) {
    if (err) {
      return callback(err);
    }
    propertyAccount.resetProperty(gameId, prop, reason, function (err) {
      callback(err);
    });
  });
};

module.exports = {
  /**
   * Create a marketplace. This should be done only once, afterwards get it using getMarketplace
   * @param scheduler
   * @returns {Marketplace}
   */
  createMarketplace: function (scheduler) {
    marketplace = new Marketplace(scheduler);

    teamAccount.init();
    propertyAccount.init();
    propWrap.init();

    return marketplace;
  },
  /**
   * Gets the marketplace, throws an error, if not defined
   * @returns {*}
   */
  getMarketplace: function () {
    if (!marketplace) {
      throw new Error('You must create a marketplace first before getting it');
    }
    return marketplace;
  }
};
