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
var ferroSocket = require('../ferroSocket');

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
  this.ferroSocket = ferroSocket.get();

  if (this.scheduler) {
    /**
     * This is the 'interest' event launched by the gameScheduler
     */
    this.scheduler.on('interest', function (event) {
      console.log('Marketplace: onInterest');
      self.payRents(event.gameId, function (err) {
        if (err) {
          console.log('ERROR, interests not payed! Message: ' + err.message);
          event.callback(err);
          return;
        }
        console.log('Timed interests payed');
        event.callback(null, event);
      });
    });
    /**
     * This is the 'start' event launched by the gameScheduler. Pay interests once.
     */
    this.scheduler.on('start', function (event) {
      console.log('Marketplace: onStart');
      self.payInterests(event.gameId, function (err) {
        if (err) {
          console.log('ERROR, initial interests not payed! Message: ' + err.message);
          event.callback(err);
          return;
        }
        console.log('Timed interests payed');
        event.callback(null, event);
      });
    });
    /**
     * This is the 'end' event launched by the gameScheduler. Pay the final rents & interests
     */
    this.scheduler.on('end', function (event) {
      console.log('Marketplace: onEnd');
      self.payFinalRents(event.gameId, function (err) {
        if (err) {
          console.log('ERROR, final interests not payed! Message: ' + err.message);
          event.callback(err);
          return;
        }
        console.log('Timed interests payed');
        event.callback(null, event);
      });
    });
  }

  if (this.ferroSocket) {
    this.ferroSocket.on('marketplace', function (req) {
      console.log('Marketplace: ' + req.cmd);
      switch (req.cmd) {
        case 'buyProperty':
          self.buyProperty(req.gameId, req.teamId, req.propertyId, function (err, res) {
            if (err) {
              req.response('marketplace', {cmd: 'buyProperty', err: err.message, result: res});
            }
            else {
              req.response('marketplace', {cmd: 'buyProperty', result: res});
            }
          });
          break;
      }
    });
  }
}

util.inherits(Marketplace, EventEmitter);

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
  propWrap.getProperty(gameId, propertyId, function (err, property) {
    if (err) {
      return callback(err);
    }
    if (!property) {
      return callback(new Error('No property for this location'), {message: 'Dieses Ort kann nicht gekauft werden'});
    }
    gameCache.getGameData(gameId, function (err, res) {
      if (err) {
        console.error(err);
        return callback(err);
      }
      var gp = res.gameplay;
      var team = res.teams[teamId];

      if (!gp || !team) {
        return callback(new Error('Gameplay error or team invalid'));
      }

      //------------------------------------------------------------------------------------------------------------------
      // Now check if the property is still available or sold. There are 3 cases to handle
      if (!property.gamedata || !property.gamedata.owner || property.gamedata.owner.length === 0) {
        // CASE 1: property is available, the team is going to buy it
        console.log(property.location.name + ' is available');
        propertyAccount.buyProperty(gp, property, team, function (err, info) {
          if (err) {
            console.error(err);
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
        console.log(property.location.name + ' already belongs the team');
        return callback(new Error('Grundstück gehört bereits dieser Gruppe'));
      }
      //------------------------------------------------------------------------------------------------------------------
      else {
        // CASE 3: property belongs to another team, pay the rent
        propertyAccount.getPropertyValue(gp, property, function (err, val) {
          teamAccount.chargeToAnotherTeam(gameId, teamId, property.gamedata.owner, val.amount, 'Miete ' + property.location.name, function (err, info) {
            console.log(property.location.name + ' is already sold to another team');
            if (err) {
              console.error(err);
              return callback(err);
            }
            return callback(null, {property: property, owner: property.gamedata.owner, amount: info.amount});
          })
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
  propWrap.getTeamProperties(gameId, teamId, function (err, properties) {
    if (err) {
      return callback(err);
    }

    if (properties.length === 0) {
      console.log('nothing to build');
      return callback(null, {amount: 0, log: []});
    }

    gameCache.getGameData(gameId, function (err, res) {
      if (err) {
        console.error(err);
        return callback(err);
      }
      var gp = res.gameplay;
      var team = res.teams[teamId];

      if (!gp || !team) {
        return callback(new Error('Gameplay error or team invalid'));
      }

      var log = [];
      var handled = 0;

      for (var i = 0; i < properties.length; i++) {
        propertyAccount.buyBuilding(gp, properties[i], team, function (err, info) {
          if (err) {
            console.log(err);
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
                  console.error(err);
                  return callback(err);
                }
                return callback(null, {amount: totalAmount, log: log});
              });
            }
          }
        });
      }
    });
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
      console.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var paid = 0;
    var error = null;
    if (gp.gameParams.interestCyclesAtEndOfGame < 1) {
      // No cycles, no interests, return
      return callback(null);
    }

    for (var i = 0; i < gp.gameParams.interestCyclesAtEndOfGame; i++) {
      self.payInterests(gameId, function (err) {
        if (err) {
          error = err;
        }
        paid++;
        if (paid === gp.gameParams.interestCyclesAtEndOfGame) {
          callback(error);
        }
      })
    }
  });
};

/**
 * Pay Interest (this is the fix value) for all teams.
 * Money: bank->team
 * @param callback
 */
Marketplace.prototype.payInterests = function (gameId, callback) {
  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var teams = _.valuesIn(res.teams);
    var paid = 0;
    var error = null;

    for (var i = 0; i < teams.length; i++) {
      teamAccount.payInterest(teams[i].uuid, gameId, gp.gameParams.interest, function (err) {
        if (err) {
          error = err;
        }
        paid++;
        if (paid === teams.length) {
          callback(error);
        }
      })
    }
  });
};

/**
 * Pays the rents (each hour) for a team
 * @param gp
 * @param team
 * @param callback
 */
Marketplace.prototype.payRentsForTeam = function (gp, team, callback) {
  propertyAccount.getRentRegister(gp, team, function (err, info) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    propertyAccount.payInterest(gp, info.register, function (err) {
      if (err) {
        console.log(err);
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
 * Money: bank->propertIES->team
 * @param gameId
 * @param callback
 */
Marketplace.prototype.payRents = function (gameId, callback) {
  var self = this;
  self.payInterests(gameId, function (err) {
    if (err) {
      return callback(err);
    }

    propWrap.allowBuilding(gameId, function (err, nbAffected) {
      console.log('Building allowed again for ' + nbAffected.toString() + ' buildings');

      gameCache.getGameData(gameId, function (err, res) {
        if (err) {
          console.error(err);
          return callback(err);
        }
        var gp = res.gameplay;
        var teams = _.valuesIn(res.teams);
        var paid = 0;
        var error = null;

        for (var i = 0; i < teams.length; i++) {
          self.payRentsForTeam(gp, teams[i], function (err) {
            if (err) {
              error = err;
            }
            paid++;
            if (paid === teams.length) {
              return callback(error);
            }
          })
        }
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
  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var team = res.teams[teamId];

    chancelleryAccount.playChancellery(gp, team, function (err, res) {
      callback(err, res);
    })
  })
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
  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    var gp = res.gameplay;
    var team = res.teams[teamId];

    chancelleryAccount.gamble(gp, team, amount, function (err, res) {
      callback(err, res);
    })
  })
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
