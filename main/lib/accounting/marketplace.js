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

/**
 * Buy a property or at least try to
 * 1) Success: property goes to the team, Money flow:
 *    team->property->bank
 * 2) Already sold: pay taxes, Money:
 *    team->property->owner
 *
 * @param gameId
 * @param teamId
 * @param locationId
 * @param callback
 */
function buyProperty(gameId, teamId, locationId, callback) {
  propWrap.getProperty(gameId, locationId, function (err, property) {
    if (err) {
      return callback(err);
    }
    if (!property) {
      return callback(new Error('No property for this location'));
    }
    var gp = gameCache.getGameplaySync(gameId);
    var team = gameCache.getTeamSync(gameId, teamId);

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
            return callback(new Error('Fehler beim Grundstückkauf: ' + err.message));
          }
          // that's it!
          return callback(null, {property: property, amount: info.amount});
        });
      });
    }
    //------------------------------------------------------------------------------------------------------------------
    else if (property.gamedata.owner === teamId) {
      // CASE 2: property belongs to the team which wants to buy it, do nothing
      return callback(err, new Error('Grundstück gehört bereits dieser Gruppe'));
    }
    //------------------------------------------------------------------------------------------------------------------
    else {
      // CASE 3: property belongs to another team, pay the rent

    }
  });
}

/**
 * Build a house for a specific property
 * Money: team->property->bank
 *
 * @param team
 * @param property
 * @param callback
 */
function buildHouse(team, property, callback) {
}

/**
 * Build houses for all porperties of a team
 * Same money flow as buildHouse
 * @param team
 * @param callback
 */
function buildHouses(team, callback) {
}


/**
 * Pay Interest for a specific team
 * Money: bank->team
 * @param gameId
 * @param teamId
 * @param callback
 */
function payInterest(gameId, teamId, callback) {
  var gp = gameCache.getGameplaySync(gameId);

  teamAccount.payInterest(teamId, gameId, gp.gameParams.interest, function (err) {
    if (err) {
      console.log('Marketplace.payInterest error: ' + err);
    }
    callback(err);
  });

}

/**
 * Pay Interest, this is the fix value
 * Money: bank->team
 * @param callback
 */
function payInterests(gameId, callback) {
  var gp = gameCache.getGameplaySync(gameId);
  var teams = gameCache.getTeamsSync(gameId);
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
}

/**
 * Pays the rent for one specific team
 * Money: bank->propertIES->team
 * @param team
 * @param callback
 */
function payRent(team, callback) {
}

/**
 * Pays the rents for all teams
 * Same moneyflow as payRent
 * @param callback
 */
function payRents(callback) {
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
  payInterest: payInterest,
  payInterests: payInterests,
  buyProperty:buyProperty
};
