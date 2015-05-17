/**
 * The property account is for statistical purposes: how much did a team invest into a property?
 * how much did it get out from it?
 *
 * The following values are taken into account:
 * - buying the property
 * - interests every hour
 * - buying a house / hotel
 * - rents from other teams
 *
 * Created by kc on 20.04.15.
 */
'use strict';
var propWrap = require('../propertyWrapper');
var propertyTransaction = require('./../../../common/models/accounting/propertyTransaction');
var _ = require('lodash');
var moment = require('moment');
var ferroSocket;

/**
 * Buy a property. The property must be free, otherwise this function rises an error.
 * @param gameplay
 * @param property is the property itself, not the ID
 * @param team the team buying
 * @param callback
 */
function buyProperty(gameplay, property, team, callback) {

  if (!(!property.gamedata || !property.gamedata.owner || property.gamedata.owner === '')) {
    // This property already belongs to someone, we do not accept it
    console.warn('Can not buy property ' + property.location.name + ', it is not free');
    return callback(new Error('Property not free'));
  }

  // Set the data
  property.gamedata = {
    owner: team.uuid,
    buildings: 0
  };
  propWrap.updateProperty(property, function (err) {
    if (err) {
      // not updating the property should cause an untouched property. Try again later
      return callback(err);
    }

    var retVal = {
      amount: property.pricelist.price
    };

    var pt = new propertyTransaction.Model();
    pt.gameId = gameplay.internal.gameId;
    pt.propertyId = property.uuid;
    pt.transaction = {
      origin: {
        uuid: team.uuid,
        category: 'team'
      },
      amount: (-1) * retVal.amount, // buy is negative earning on the property
      info: 'Kauf'
    };

    propertyTransaction.book(pt, function (err) {
      if (err) {
        console.error(err);
      }
      callback(err, retVal);
    });

  })
}

/**
 * Resets a property: deletes the owner and the saldo of the property, but does not manipulate
 * any user account
 * @param gameId
 * @param property
 * @param reason
 * @param callback
 */
function resetProperty(gameId, property, reason, callback) {
  getBalance(gameId, property.uuid, function (err, info) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    property.gamedata.buildingEnabled = false;
    property.gamedata.buildings = 0;
    property.gamedata.owner = undefined;

    propWrap.updateProperty(property, function (err) {
      if (err) {
        console.error(err);
        return callback(err);
      }

      var pt = new propertyTransaction.Model();
      pt.gameId = gameId;
      pt.propertyId = property.uuid;
      pt.transaction = {
        origin: {
          category: 'bank'
        },
        amount: (-1) * info.balance,
        info: 'Manuell zurückgesetzt: ' + reason
      };

      propertyTransaction.book(pt, function (err) {
        if (err) {
          console.error(err);
        }
        callback(err);
      });

    })
  })
}
/**
 * Buy a building for a property
 * @param gameplay
 * @param property
 * @param team
 * @param callback
 * @returns {*}
 */
function buyBuilding(gameplay, property, team, callback) {
  if (property.gamedata.owner !== team.uuid) {
    return callback(new Error('this is not the owner'));
  }
  if (property.gamedata.buildings >= 5) {
    // there is nothing to do, already a hotel
    return callback(new Error('can not build, already a hotel there'));
  }
  if (!property.gamedata.buildingEnabled) {
    return callback(new Error('can not build now, wait for next round'));
  }
  property.gamedata.buildings++;
  property.gamedata.buildingEnabled = false;

  propWrap.updateProperty(property, function (err) {
    if (err) {
      return callback(err);
    }
    var retVal = {
      amount: Math.abs(getBuildingPrice(property)) * (-1),
      buildingNb: property.gamedata.buildings,
      property: property.uuid,
      propertyName: property.location.name
    };

    // Save a property transaction
    var pt = new propertyTransaction.Model();
    pt.gameId = gameplay.internal.gameId;
    pt.propertyId = property.uuid;
    pt.transaction = {
      origin: {
        uuid: team,
        type: 'team'
      },
      amount: retVal.amount, // building buildings is negative earning on the property
      info: 'Hausbau'
    };

    propertyTransaction.book(pt, function (err) {
      if (err) {
        console.error(err);
      }
      callback(err, retVal);
    });
  });
}

/**
 * This is the rent function when a team comes to a already sold property
 * @param gameplay
 * @param property
 * @param debitor
 * @param callback
 */
function payRent(gameplay, property, debitor, callback) {
  getPropertyValue(gameplay, property, function (err, info) {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
}

/**
 * Pays the interest (normally every hour) for properties: their value. This function
 * just books it in the property account. The register is the one retrieved using
 * getRentRegister
 * @param gameplay
 * @param register
 * @param callback
 */
function payInterest(gameplay, register, callback) {
  var t = 0;
  var error = null;
  if (register.length === 0) {
    // nothing to pay
    console.log('nothing to pay');
    return callback(null);
  }
  for (var i = 0; i < register.length; i++) {
    // Save a property transaction
    var pt = new propertyTransaction.Model();
    pt.gameId = gameplay.internal.gameId;
    pt.propertyId = register[i].uuid;
    pt.transaction = {
      origin: {
        type: 'bank'
      },
      amount: Math.abs(register[i].amount), // interest is positive earning on the property
      info: 'Zinsen ' + register[i].name
    };

    propertyTransaction.book(pt, function (err) {
      if (err) {
        console.error(err);
        error = err;
      }
      t++;
      if (t === register.length) {
        callback(error);
      }
    });
  }
}

/**
 * Get the rent register: nothing is booked, but the rent of all properties of a team
 * is evaluated
 * @param gameplay
 * @param team
 * @param callback
 */
function getRentRegister(gameplay, team, callback) {
  propWrap.getTeamProperties(gameplay.internal.gameId, team.uuid, function (err, properties) {
    if (err) {
      return callback(err);
    }

    var info = {
      register: [],
      totalAmount: 0,
      teamId: team.uuid
    };
    if (properties.length === 0) {
      return callback(null, info);
    }

    for (var i = 0; i < properties.length; i++) {
      getPropertyValue(gameplay, properties[i], function (err, propVal) {
        if (err) {
          info.register.push({err: err.message});
        }
        else {
          info.register.push(propVal);
          info.totalAmount += propVal.amount;
        }
        if (info.register.length === properties.length) {
          return callback(null, info);
        }
      });
    }
  });
}

/**
 * Gets the account statement for all properties belonging to a team, all bookings up to a given time
 *
 * Param order p-params: [start] [end] callback
 * If only one param (start|end) is supplied, it is handled as start
 *
 * @param gameId
 * @param propertyId, when undefined: all
 * @param p1
 * @param p2
 * @param p3
 */
function getAccountStatement(gameId, propertyId, p1, p2, p3) {
  var tsStart = p1;
  var tsEnd = p2;
  var callback = p3;
  if (_.isFunction(p1)) {
    callback = p1;
    tsStart = undefined;
    tsEnd = moment();
  }
  else if (_.isFunction(p2)) {
    callback = p2;
    tsStart = p2;
    tsEnd = moment();
  }
  if (!tsEnd) {
    tsEnd = moment();
  }

  propertyTransaction.getEntries(gameId, propertyId, tsStart, tsEnd, function (err, data) {
    callback(err, data);
  })
}

/**
 * Gets the balance of the property, at a given time or now
 * @param gameId
 * @param propertyId
 * @param p1 timestamp until when the balance shall be gotten (optional, default: now)
 * @param p2 callback
 */
function getBalance(gameId, propertyId, p1, p2) {
  var callback = p2;
  var ts = p1;
  if (_.isFunction(p1)) {
    callback = p1;
    ts = moment();
  }

  propertyTransaction.getEntries(gameId, propertyId, undefined, ts, function (err, data) {
    if (err) {
      return callback(err);
    }
    var saldo = 0;
    for (var i = 0; i < data.length; i++) {
      saldo += data[i].transaction.amount;
    }
    callback(err, {balance: saldo, entries: i});
  })
}

/**
 * Returns the value of the property for rent and interest
 * @param property
 * @returns {*}
 */
function getPropertyValue(gameplay, property, callback) {
  propWrap.getPropertiesOfGroup(property.gameId, property.pricelist.propertyGroup, function (err, properties) {
    if (err) {
      return callback(err);
    }
    var sameGroup = 0;
    for (var i = 0; i < properties.length; i++) {
      if (properties[i].gamedata.owner === property.gamedata.owner) {
        sameGroup++;
      }
    }

    var retVal = {
      propertyName: property.location.name,
      property: property.uuid
    };

    var factor = 1;
    if ((properties.length > 1) && (sameGroup === properties.length)) {
      // all properties in a group belong the same team, pay more!
      console.log('Properties in same group, paying more!');
      factor = gameplay.gameParams.rentFactors.allPropertiesOfGroup || 2;
      retVal.allPropertiesOfGroup = true;
    }

    var rent = 0;
    var buildingNb = property.gamedata.buildings || 0;

    switch (buildingNb) {
      case 0:
        rent = property.pricelist.rents.noHouse;
        break;
      case 1:
        rent = property.pricelist.rents.oneHouse;
        break;
      case 2:
        rent = property.pricelist.rents.twoHouses;
        break;
      case 3:
        rent = property.pricelist.rents.threeHouses;
        break;
      case 4:
        rent = property.pricelist.rents.fourHouses;
        break;
      case 5:
        rent = property.pricelist.rents.hotel;
        break;
      default:
        return callback(new Error('invalid building nb'));
    }

    retVal.amount = rent * factor;
    callback(null, retVal);
  });
}

/**
 * Get the price for a building
 * @param property
 * @returns {propertySchema.pricelist.pricePerHouse|*}
 */
function getBuildingPrice(property) {
  return property.pricelist.pricePerHouse;
}

/**
 * Handles the commands received over the ferroSocket
 * @param req
 */
var socketCommandHandler = function (req) {
  console.log('propertyAccount socket handler: ' + req.cmd.name);
  switch (req.cmd.name) {
    case 'getAccountStatement':
      getAccountStatement(req.gameId, req.cmd.propertyId, req.cmd.start, req.cmd.end, function (err, data) {
        var resp = {
          err: err, cmd: {
            name: 'accountStatement', data: data
          }
        };
        req.response('propertyAccount', resp);
      });
  }
};


module.exports = {
  getBuildingPrice: getBuildingPrice,
  getPropertyValue: getPropertyValue,
  getRentRegister: getRentRegister,
  payInterest: payInterest,
  buyProperty: buyProperty,
  buyBuilding: buyBuilding,
  getBalance: getBalance,
  resetProperty: resetProperty,

  init: function () {
    ferroSocket = require('../ferroSocket').get();
    ferroSocket.on('propertyAccount', socketCommandHandler);
  }
};
