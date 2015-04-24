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
var propertyTransaction = require('./models/propertyTransaction');

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
        uuid: team,
        type: 'team'
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

module.exports = {
  buyProperty: buyProperty
};
