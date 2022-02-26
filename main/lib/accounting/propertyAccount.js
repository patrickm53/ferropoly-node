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

const propWrap            = require('../propertyWrapper');
const propertyTransaction = require('./../../../common/models/accounting/propertyTransaction');
const teamAccount         = require('./teamAccount');
const logger              = require('../../../common/lib/logger').getLogger('propertyAccount');
const async               = require('async');
const _                   = require('lodash');
const moment              = require('moment');
const propertyActions     = require('../../../components/checkin-datastore/lib/properties/actions');

let ferroSocket;

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
    logger.warn('Can not buy property ' + property.location.name + ', it is not free');
    return callback(new Error('Property not free'));
  }

  // Set the data
  property.gamedata = {
    owner    : team.uuid,
    boughtTs : new Date(),
    buildings: 0
  };
  propWrap.updateProperty(property, function (err) {
    if (err) {
      // not updating the property should cause an untouched property. Try again later
      return callback(err);
    }

    let retVal = {
      amount: property.pricelist.price
    };

    let pt         = new propertyTransaction.Model();
    pt.gameId      = gameplay.internal.gameId;
    pt.propertyId  = property.uuid;
    pt.transaction = {
      origin: {
        uuid    : team.uuid,
        category: 'team'
      },
      amount: (-1) * retVal.amount, // buy is negative earning on the property
      info  : 'Kauf'
    };

    propertyTransaction.book(pt, function (err) {
      if (err) {
        logger.error(err);
      }

      if (ferroSocket) {
        ferroSocket.emitToAdmins(gameplay.internal.gameId, 'admin-propertyAccount', {
          cmd        : 'propertyBought',
          property   : property,
          transaction: pt
        });

        ferroSocket.emitToTeam(gameplay.internal.gameId, team.uuid, 'checkinStore', propertyActions.updateProperty(property));
      }
      callback(err, retVal);
    });
  });
}

/**
 * Charges rent for a property:
 *   Visitor pays to Owner, same value also added to the property Account
 *
 * @param gp
 * @param property
 * @param teamId
 * @param callback
 */
function chargeRent(gp, property, teamId, callback) {
  getPropertyValue(gp, property, function (err, val) {
    if (err) {
      return callback(err);
    }
    let options = {
      gameId        : gp.internal.gameId,
      amount        : val.amount,
      info          : 'Miete ' + property.location.name,
      debitorTeamId : teamId,
      creditorTeamId: property.gamedata.owner
    };

    // Charge value to the other team
    teamAccount.chargeToAnotherTeam(options, function (err, info) {
      if (err) {
        return callback(err);
      }
      // Add entry for property (income)
      let pt         = new propertyTransaction.Model();
      pt.gameId      = options.gameId;
      pt.propertyId  = property.uuid;
      pt.transaction = {
        origin: {
          category: 'team'
        },
        amount: info.amount,
        info  : 'Miete'
      };

      propertyTransaction.book(pt, function (err) {
        if (err) {
          logger.error(err);
          return callback(err);
        }
        return callback(null, {property: property, owner: property.gamedata.owner, amount: info.amount});
      });
    });
  });
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
      logger.error(err);
      return callback(err);
    }
    property.gamedata.buildingEnabled = false;
    property.gamedata.buildings       = 0;
    property.gamedata.owner           = undefined;

    propWrap.updateProperty(property, function (err) {
      if (err) {
        logger.error(err);
        return callback(err);
      }

      let pt         = new propertyTransaction.Model();
      pt.gameId      = gameId;
      pt.propertyId  = property.uuid;
      pt.transaction = {
        origin: {
          category: 'bank'
        },
        amount: (-1) * info.balance,
        info  : 'Manuell zurückgesetzt: ' + reason
      };

      propertyTransaction.book(pt, function (err) {
        if (err) {
          logger.error(err);
        }
        callback(err);
      });
    });
  });
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
    let retVal = {
      amount      : Math.abs(getBuildingPrice(property)) * (-1),
      buildingNb  : property.gamedata.buildings,
      property    : property.uuid,
      propertyName: property.location.name
    };

    // Save a property transaction
    let pt         = new propertyTransaction.Model();
    pt.gameId      = gameplay.internal.gameId;
    pt.propertyId  = property.uuid;
    pt.transaction = {
      origin: {
        uuid: team.uuid,
        type: 'team'
      },
      amount: retVal.amount, // building buildings is negative earning on the property
      info  : 'Hausbau'
    };

    propertyTransaction.book(pt, function (err) {
      if (err) {
        logger.error(err);
      }
      if (ferroSocket) {
        ferroSocket.emitToAdmins(gameplay.internal.gameId, 'admin-propertyAccount', {
          cmd        : 'buildingBuilt',
          property   : property,
          transaction: pt
        });

        ferroSocket.emitToTeam(gameplay.internal.gameId, team.uuid, 'checkinStore', propertyActions.updateProperty(property));
      }
      callback(err, retVal);
    });
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

  if (register.length === 0) {
    // nothing to pay
    logger.debug('nothing to pay');
    return callback(null);
  }

  async.each(register,
    function (prop, cb) {
      logger.info('Book propertyAccount transaction for property', prop);
      let pt         = new propertyTransaction.Model();
      pt.gameId      = gameplay.internal.gameId;
      pt.propertyId  = prop.uuid;
      pt.transaction = {
        origin: {
          type: 'bank'
        },
        amount: Math.abs(prop.amount), // interest is positive earning on the property
        info  : 'Zinsen ' + prop.propertyName
      };

      propertyTransaction.book(pt, cb);
    },
    callback
  );
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

    let info = {
      register   : [],
      totalAmount: 0,
      teamId     : team.uuid
    };

    async.each(properties,
      function (property, cb) {
        getPropertyValue(gameplay, property, function (err, propVal) {
          if (err) {
            return cb(err);
          }
          info.register.push(propVal);
          info.totalAmount += propVal.amount;
          cb();
        });
      },
      function (err) {
        callback(err, info);
      }
    );
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
  let tsStart  = p1;
  let tsEnd    = p2;
  let callback = p3;
  if (_.isFunction(p1)) {
    callback = p1;
    tsStart  = undefined;
    tsEnd    = moment();
  }
  else if (_.isFunction(p2)) {
    callback = p2;
    tsStart  = p2;
    tsEnd    = moment();
  }
  if (!tsEnd) {
    tsEnd = moment();
  }

  propertyTransaction.getEntries(gameId, propertyId, tsStart, tsEnd, function (err, data) {
    callback(err, data);
  });
}

/**
 * Gets the balance of the property, at a given time or now
 * @param gameId
 * @param propertyId
 * @param p1 timestamp until when the balance shall be gotten (optional, default: now)
 * @param p2 callback
 */
function getBalance(gameId, propertyId, p1, p2) {
  let callback = p2;
  let ts       = p1;
  if (_.isFunction(p1)) {
    callback = p1;
    ts       = moment();
  }

  propertyTransaction.getEntries(gameId, propertyId, undefined, ts, function (err, data) {
    if (err) {
      return callback(err);
    }
    let saldo = 0;
    let i;
    for (i = 0; i < data.length; i++) {
      saldo += data[i].transaction.amount;
    }
    callback(err, {balance: saldo, entries: i});
  });
}

/**
 * Returns the value of the property for rent and interest
 * @param gameplay
 * @param property
 * @param callback
 * @returns {*}
 */
function getPropertyValue(gameplay, property, callback) {
  propWrap.getPropertiesOfGroup(property.gameId, property.pricelist.propertyGroup, function (err, properties) {
    if (err) {
      return callback(err);
    }
    let sameGroup = 0;
    for (let i = 0; i < properties.length; i++) {
      if (properties[i].gamedata.owner === property.gamedata.owner) {
        sameGroup++;
      }
    }

    let retVal = {
      propertyName: property.location.name,
      property    : property.uuid
    };

    let factor = 1;
    if ((properties.length > 1) && (sameGroup === properties.length)) {
      // all properties in a group belong the same team, pay more!
      logger.info('Properties in same group, paying more!');
      factor                      = gameplay.gameParams.rentFactors.allPropertiesOfGroup || 2;
      retVal.allPropertiesOfGroup = true;
    }

    let rent       = 0;
    let buildingNb = property.gamedata.buildings || 0;

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
    retVal.uuid   = property.uuid;
    callback(null, retVal);
  });
}

/**
 * Get the price for a building
 * @param property
 * @returns {*}
 */
function getBuildingPrice(property) {
  return property.pricelist.pricePerHouse;
}

/**
 * Returns the profitability of all or a specific property
 * @param gameId
 * @param propertyId (can be undefined if all are requested)
 * @param callback
 */
function getPropertyProfitability(gameId, propertyId, callback) {
  propertyTransaction.getSummary(gameId, propertyId, callback);
}

/**
 * Handles the commands received over the ferroSocket
 * @param req
 */
let socketCommandHandler = function (req) {
  logger.info('propertyAccount socket handler: ' + req.cmd);
  switch (req.cmd.name) {
    case 'getAccountStatement':
      logger.error(new Error('OBSOLETE, replace socket.io getAccountStatement by GET request'));
      getAccountStatement(req.gameId, req.propertyId, req.start, req.end, function (err, data) {
        let resp = {
          err : err,
          cmd : 'accountStatement',
          data: data
        };
        req.response('propertyAccount', resp);
      });
  }
};


module.exports = {
  getBuildingPrice        : getBuildingPrice,
  getPropertyValue        : getPropertyValue,
  getRentRegister         : getRentRegister,
  payInterest             : payInterest,
  buyProperty             : buyProperty,
  buyBuilding             : buyBuilding,
  getBalance              : getBalance,
  resetProperty           : resetProperty,
  getPropertyProfitability: getPropertyProfitability,
  getAccountStatement     : getAccountStatement,
  chargeRent              : chargeRent,

  init: function () {
    ferroSocket = require('../ferroSocket').get();
    if (ferroSocket) {
      ferroSocket.on('propertyAccount', socketCommandHandler);

      ferroSocket.on('player-connected', function (data) {
        propWrap.getTeamProperties(data.gameId, data.teamId, function (err, props) {
          if (err) {
            logger.error(err);
            return;
          }
          ferroSocket.emitToTeam(data.gameId, data.teamId, 'checkinStore', propertyActions.setProperties(props));

        });
      });
    }

  }
};
