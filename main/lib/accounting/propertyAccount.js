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

function buyBuilding(gameplay, property, team, callback) {
  if (property.gamedata.owner !== team.uuid) {
    return callback(new Error('this is not the owner'));
  }
  if (property.gamedata.buildings >= 5) {
    // there is nothing to do, already a hotel
    return callback(new Error('can not build, already a hotel there'));
  }
  property.gamedata.buildings++;
  propWrap.updateProperty(property, function (err) {
    if (err) {
      return callback(err);
    }
    var retVal = {
      amount: getBuildingPrice(property),
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
      amount: (-1) * retVal.amount, // building buildings is negative earning on the property
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
 * Returns the value of the property for rent and interest
 * @param property
 * @returns {*}
 */
function getPropertyValue(property) {
  var buildingNb = 0;
  if (property.gamedata.buildings) {
    buildingNb = property.gamedata.buildings;
  }
  switch (buildingNb) {
    case 0:
      return property.pricelist.rents.noHouse;
    case 1:
      return property.pricelist.rents.oneHouse;
    case 2:
      return property.pricelist.rents.twoHouses;
    case 3:
      return property.pricelist.rents.threeHouses;
    case 4:
      return property.pricelist.rents.fourHouses;
    case 5:
      return property.pricelist.rents.hotel;
    default:
      console.log('Invalid number of houses: ' + buildingNb);
      return 0;
  }
}

function getBuildingPrice(property) {
  return property.pricelist.pricePerHouse;
}
module.exports = {
  getBuildingPrice: getBuildingPrice,
  getPropertyValue: getPropertyValue,

  buyProperty: buyProperty,
  buyBuilding: buyBuilding
};
