/**
 * All market actions are done over the marketplace
 *
 * Created by kc on 20.04.15.
 */

var gameCache          = require('../gameCache');
var propWrap           = require('../propertyWrapper');
var teamAccount        = require('./teamAccount');
var propertyAccount    = require('./propertyAccount');
var chancelleryAccount = require('./chancelleryAccount');
var propertyActions    = require('../../components/checkin-datastore/lib/properties/actions');
var logger             = require('../../../common/lib/logger').getLogger('marketplace');
var travelLog          = require('../../../common/models/travelLogModel');
var async              = require('async');
var moment             = require('moment');
var EventEmitter       = require('events').EventEmitter;
var util               = require('util');
var _                  = require('lodash');
var marketplace;
var ferroSocket;
/**
 * Just a logger helper
 * @param gameId
 * @param text
 * @param obj
 */
function marketLog(gameId, text, obj) {
  logger.info(gameId + ': ' + text, obj);
}

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
      marketLog(event.gameId, 'Marketplace: onInterest');
      self.payRents({gameId: event.gameId}, function (err) {
        if (err) {
          marketLog(event.gameId, 'ERROR, interests not paid! Message: ' + err.message);
          event.callback(err);
          return;
        }
        marketLog(event.gameId, 'Timed interests paid');
        event.callback(null, event);
      });
    });
    /**
     * This is the 'prestart' event launched by the gameScheduler. Game is going to start soon, refresh cache
     * Pay start capital
     */
    this.scheduler.on('prestart', function (event) {
      marketLog(event.gameId, 'Marketplace: onPrestart');
      gameCache.refreshCache(function (err) {
        marketLog(event.gameId, 'Cache refreshed', err);
        self.payInitialAsset(event.gameId, function (err) {
          if (err) {
            marketLog(event.gameId, 'ERROR, initial assets not paid! Message: ' + err.message);
            event.callback(err);
            return;
          }
          marketLog(event.gameId, 'Initial assets paid');
          event.callback(null, event);
        });
      });
    });
    /**
     * This is the 'start' event launched by the gameScheduler. Nothing is done currently.
     */
    this.scheduler.on('start', function (event) {
      marketLog(event.gameId, 'Marketplace: onStart');
      event.callback(null, event);
    });
    /**
     * This is the 'end' event launched by the gameScheduler. Pay the final rents & interests
     */
    this.scheduler.on('end', function (event) {
      marketLog(event.gameId, 'Marketplace: onEnd');
      self.payFinalRents(event.gameId, function (err) {
        if (err) {
          marketLog(event.gameId, 'ERROR, final interests not paid! Message: ' + err.message);
          event.callback(err);
          return;
        }
        marketLog(event.gameId, 'Timed interests paid');
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
  if (_.isUndefined(additionalMinutes)) {
    additionalMinutes = 0;
  }

  var start = moment(gameplay.scheduling.gameStartTs).subtract(additionalMinutes, 'minutes');
  var end   = moment(gameplay.scheduling.gameEndTs).add(additionalMinutes, 'minutes');
  if (moment().isAfter(end)) {
    marketLog(gameplay.internal.gameId, 'Game over', {
      start            : start.toDate(),
      end              : end.toDate(),
      additionalMinutes: additionalMinutes
    });
    return false;
  }
  if (moment().isBefore(start)) {
    marketLog(gameplay.internal.gameId, 'Game not started yet');
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
 * @param options is the object with the information what to do. At least with gameId, teamId and propertyId
 * @param callback
 */
Marketplace.prototype.buyProperty = function (options, callback) {
  var self = this;
  if (!options.gameId || !options.teamId || !options.propertyId) {
    return callback(new Error('At least gameId, teamId and property Id must be supplied'));
  }

  marketLog(options.gameId, 'buyProperty, team: ' + options.teamId + ' property:' + options.propertyId + ' user:' + options.user);

  propWrap.getProperty(options.gameId, options.propertyId, function (err, property) {
    if (err) {
      return callback(err);
    }
    travelLog.addPropertyEntry(options.gameId, options.teamId, property, function (err) {
      if (err) {
        logger.error(err);
      }
      // we do not care about this return, it's asynchronous and that's ok
    });
    if (!property) {
      return callback(new Error('No property for this location'), {message: 'Dieses Ort kann nicht gekauft werden'});
    }
    gameCache.getGameData(options.gameId, function (err, res) {
      if (err) {
        logger.error(err);
        return callback(err);
      }
      var gp   = res.gameplay;
      var team = res.teams[options.teamId];

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
        marketLog(options.gameId, property.location.name + ' is available');
        propertyAccount.buyProperty(gp, property, team, function (err, info) {
          if (err) {
            logger.error(err);
            return callback(err);
          }
          options.amount = info.amount;
          options.info   = 'Kauf ' + property.location.name;
          teamAccount.chargeToBank(options, function (err) {
            if (err) {
              return callback(err, {message: 'Fehler beim Grundstückkauf'});
            }
            // that's it!
            return callback(null, {property: property, amount: info.amount});
          });
        });
      }
      //------------------------------------------------------------------------------------------------------------------
      else if (property.gamedata.owner === options.teamId) {
        // CASE 2: property belongs to the team which wants to buy it, do nothing
        marketLog(options.gameId, property.location.name + ' already belongs the team');
        return callback(null, {property: property, amount: 0});
      }
      //------------------------------------------------------------------------------------------------------------------
      else {
        // CASE 3: property belongs to another team, pay the rent
        marketLog(options.gameId, property.location.name + ' is already sold to another team');
        propertyAccount.chargeRent(gp, property, options.teamId, callback);
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
      marketLog(gameId, 'nothing to build');
      return callback(null, {amount: 0, log: []});
    }

    gameCache.getGameData(gameId, function (err, res) {
      if (err) {
        logger.error(err);
        return callback(err);
      }
      var gp   = res.gameplay;
      var team = res.teams[teamId];

      if (!gp || !team) {
        return callback(new Error('Gameplay error or team invalid'));
      }

      if (!self.isOpen(gp)) {
        return callback(new Error('BuildHouses: Marketplace is closed'));
      }

      var log     = [];
      var handled = 0;

      // Callback when buying building
      var buyBuildingCallback = function (err, info) {
        if (err) {
          marketLog(gameId, err);
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
            teamAccount.chargeToBank({
              teamId: teamId,
              gameId: gameId,
              amount: totalAmount,
              info  : {info: 'Hausbau', parts: log}
            }, function (err) {
              if (err) {
                logger.error(err);
                return callback(err);
              }
              return callback(null, {amount: totalAmount, log: log});
            });
          }
        }
      };

      // Todo: use async instead of for loop
      for (var i = 0; i < properties.length; i++) {
        propertyAccount.buyBuilding(gp, properties[i], team, buyBuildingCallback);
      }
    });
  });
};


/**
 * Build a house for a single property
 * Same money flow as buildHouse
 * @param gameId
 * @param teamId
 * @param propertyId
 * @param callback
 */
Marketplace.prototype.buildHouse = function (gameId, teamId, propertyId, callback) {
  var self = this;

  propWrap.getProperty(gameId, propertyId, function (err, property) {
    if (err) {
      return callback(err);
    }

    if (property.gamedata.owner !== teamId) {
      marketLog(gameId, 'Property ' + property.location.name + ' does not belong this team, building not allowed');
      return callback(new Error('Team does not possess this property'));
    }

    gameCache.getGameData(gameId, function (err, res) {
      if (err) {
        logger.error(err);
        return callback(err);
      }
      var gp   = res.gameplay;
      var team = res.teams[teamId];

      if (!gp || !team) {
        return callback(new Error('Gameplay error or team invalid'));
      }

      if (!self.isOpen(gp)) {
        return callback(new Error('BuildHouses: Marketplace is closed'));
      }

      propertyAccount.buyBuilding(gp, property, team, function (err, info) {
        if (err) {
          marketLog(gameId, err);
          return callback(err);
        }

        teamAccount.chargeToBank({
          teamId: teamId,
          gameId: gameId,
          amount: info.amount,
          info  : {info: 'Hausbau ' + property.location.name}
        }, function (err) {
          if (err) {
            logger.error(err);
            return callback(err);
          }
          return callback(null, {amount: info.amount});
        });
      });
    });
  });
};

/**
 * Pays the initial assets of a game. This is usually done before the market opens
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
    var gp    = res.gameplay;
    var teams = _.valuesIn(res.teams);

    if (!self.isOpen(gp, 15)) {
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
    var gp        = res.gameplay;
    var tolerance = 10; // in minutes
    var count = 0;

    if (gp.gameParams.interestCyclesAtEndOfGame < 1) {
      // No cycles, no interests, return
      return callback(null);
    }

    // give a tolerance of a few minutes for closing the market place
    if (!self.isOpen(gp, tolerance)) {
      marketLog(gp.internal.gameId, 'Tolerance: ' + tolerance);
      return callback(new Error('FinalRents: Marketplace is closed'));
    }

    async.whilst(
      function () {
        return count < gp.gameParams.interestCyclesAtEndOfGame;
      },
      function (cb) {
        count++;
        self.payRents({gameId: gameId, tolerance: tolerance}, cb);
      },
      function (err) {
        callback(err);
      }
    );
  });
};

/**
 * Pay Interest (this is the fix value) for all teams.
 * Money: bank->team
 * @param callback
 */
Marketplace.prototype.payInterests = function (gameId, tolerance, callback) {
  var self = this;
  if (_.isFunction(tolerance)) {
    callback  = tolerance;
    tolerance = 0;
  }

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    var gp    = res.gameplay;
    var teams = _.valuesIn(res.teams);

    if (!self.isOpen(gp, tolerance)) {
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
Marketplace.prototype.checkNegativeAsset = function (gameId, tolerance, callback) {
  var self = this;
  if (_.isFunction(tolerance)) {
    callback  = tolerance;
    tolerance = 0;
  }

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    var gp    = res.gameplay;
    var teams = _.valuesIn(res.teams);

    if (!self.isOpen(gp, tolerance)) {
      return callback(new Error('CheckNegativeAsset: Marketplace is closed'));
    }

    async.each(teams, function (team, cb) {
      teamAccount.negativeBalanceHandling(gameId, team.uuid, gp.gameParams.debtInterest, function (err, info) {
        marketLog(gameId, 'negativeBalanceHandlingResult', info);
        if (err) {
          return cb(err);
        }
        if (info && info.amount !== 0) {
          chancelleryAccount.payToChancellery(gp, team, info.amount, 'Strafzins (negatives Guthaben)', cb);
          return;
        }
        cb();
      });
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
Marketplace.prototype.payRentsForTeam = function (gp, team, tolerance, callback) {
  if (_.isFunction(tolerance)) {
    callback  = tolerance;
    tolerance = 0;
  }

  if (!this.isOpen(gp, tolerance)) {
    return callback(new Error('PayRentsForTeam: Marketplace is closed'));
  }

  propertyAccount.getRentRegister(gp, team, function (err, info) {
    if (err) {
      marketLog(gp.internal.gameId, 'error in getRentRegister', err);
      return callback(err);
    }
    propertyAccount.payInterest(gp, info.register, function (err) {
      if (err) {
        marketLog(gp.internal.gameId, 'error in payInterest', err);
        return callback(err);
      }
      if (info.totalAmount > 0) {
        teamAccount.receiveFromBank(info.teamId, gp.internal.gameId, info.totalAmount, {
          info : 'Grundstückzins',
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
 * @param options is an object with at least the gameId and a tolerance (in minutes for market open), if given
 * @param callback
 */
Marketplace.prototype.payRents = function (options, callback) {
  var gameId    = options.gameId;
  var tolerance = options.tolerance || 0;

  if (!gameId) {
    return callback(new Error('no gameId supplied in payRents'));
  }

  var self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(err);
      return callback(err);
    }
    var gp    = res.gameplay;
    var teams = _.valuesIn(res.teams);

    if (!gp) {
      return callback(new Error('Gameplay with id ' + gameId + ' not found (payRents)'));
    }

    if (!self.isOpen(gp, tolerance)) {
      return callback(new Error('PayRents: Marketplace is closed'));
    }

    // check negative asset and pay rent
    self.checkNegativeAsset(gameId, tolerance, function (err) {
      if (err) {
        return callback(err);
      }

      self.payInterests(gameId, tolerance, function (err) {
        if (err) {
          return callback(err);
        }

        propWrap.allowBuilding(gameId, function (err, nbAffected) {
          if (err) {
            return callback(err);
          }
          if (ferroSocket) {
            // Inform clients that the can build again
            ferroSocket.emitToGame(gameId, 'checkinStore', propertyActions.buildingAllowedAgain());
          }
          marketLog(gameId, 'Building allowed again for ' + nbAffected.toString() + ' buildings');

          async.each(teams, function (team, callback) {
              self.payRentsForTeam(gp, team, tolerance, callback);
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
    var gp   = res.gameplay;
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
    var gp   = res.gameplay;
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
    teamAccount.chargeToBank({
      teamId: teamId,
      gameId: gameId,
      amount: amount,
      info  : 'Manuelle Lastschrift: ' + reason
    }, function (err) {
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
    chancelleryAccount.init();

    ferroSocket = require('../ferroSocket').get();

    return marketplace;
  },
  /**
   * Gets the marketplace, throws an error, if not defined
   * @returns {*}
   */
  getMarketplace   : function () {
    if (!marketplace) {
      throw new Error('You must create a marketplace first before getting it');
    }
    return marketplace;
  }
};
