/**
 * TEMPORARY playground for all market relevant actions. Check the name
 *
 * Created by kc on 20.04.15.
 */
'use strict';
var gameCache = require('../gameCache');
var propWrap = require('../propertyWrapper');
var teamAccount = require('./teamAccount');
var propertyAccount = require('./propertyAccount');
var _ = require('lodash');
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
function buyProperty(gameId, teamId, propertyId, callback) {
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
        return callback(new Error('Grundstück gehört bereits dieser Gruppe'));
      }
      //------------------------------------------------------------------------------------------------------------------
      else {
        // CASE 3: property belongs to another team, pay the rent
        teamAccount.chargeToAnotherTeam(gameId, teamId, property.gamedata.owner, propertyAccount.getPropertyValue(property), 'Kauf', function (err, info) {
          if (err) {
            console.error(err);
            return callback(err);
          }
          return callback(null, {property: property, owner: property.gamedata.owner, amount: info.amount});
        })
      }
    });
  });
}

/**
 * Build houses for all porperties of a team
 * Same money flow as buildHouse
 * @param gameId
 * @param teamId
 * @param callback
 */
function buildHouses(gameId, teamId, callback) {
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
}

/**
 * Pay Interest (this is the fix value) for all teams.
 * Money: bank->team
 * @param callback
 */
function payInterests(gameId, callback) {
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
}

/**
 * Pays the rents (each hour) for a team
 * @param gp
 * @param team
 * @param callback
 */
function payRentsForTeam(gp, team, callback) {
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
}

/**
 * Pays the rents for all teams, also releasing the buildingEnabled lock for the next round
 * Money: bank->propertIES->team
 * @param gameId
 * @param callback
 */
function payRents(gameId, callback) {
  payInterests(gameId, function (err) {
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
          payRentsForTeam(gp, teams[i], function (err) {
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
}

/**
 * Chancellery, every time a team calls (be sure that they are on the line,
 * no false alarms: only call the function when really editing the team).
 *
 * You can loose or win a random amount
 *
 * Money: team->chancellery   (negative amount)
 *        bank->team          (positive amount)
 *
 * @param team
 * @param callback
 */
function chancellery(team, callback) {
}

/**
 * Chancellery Game: either you win or you loose. Usually only loosing money
 * is taken into account, rising the value of the chancellery
 *
 * Money: team->chancellery   (negative amount)
 *        bank->team          (positive amount)
 *
 * @param team
 * @param amount
 * @param callback
 */
function chancelleryGame(team, amount, callback) {
}

/**
 * The winner takes it all: getting the complete money of the chancellery
 *
 * Money: chancellery->team
 * @param team
 * @param callback
 */
function getChancelleryJackpot(team, callback) {
}

/**
 * A very exceptional case, but might be needed: increasing or decreasing
 * the account of a team due to an error, penalty or what so ever
 *
 * @param team
 * @param amount
 * @param reason
 * @param callback
 */
function manipulateTeamAccount(team, amount, reason, callback) {
}

module.exports = {
  payInterests: payInterests,
  buyProperty: buyProperty,
  buildHouses: buildHouses,
  payRents: payRents
};
