/**
 * Library just offering some property related stuff needed in different places
 * Created by christian on 14.12.16.
 */
const _ = require('lodash');
/**
 * Calculate the distance between two loactions (direct way, just Pythagoras)
 * @param origin
 * @param target
 * @returns {number}
 */
function calculateDistance(origin, target) {
  let a = Math.pow((origin.location.position.lat - target.location.position.lat), 2);
  let b = Math.pow((origin.location.position.lng - target.location.position.lng), 2);
  return Math.sqrt(a + b);
}
/**
 * Calculate the distances between one property and all others
 * @param originId
 * @param properties
 * @returns {*}
 */
function calculateDistances(originId, properties) {
  let result = [];
  let origin = _.find(properties, {'uuid': originId});
  if (!origin) {
    return [];
  }
  let i;
  for (i = 0; i < properties.length; i++) {
    result.push({propertyId: properties[i].uuid, distance: calculateDistance(origin, properties[i])});
  }
  return _.sortBy(result, 'distance');
}

module.exports = {
  calculateDistances: calculateDistances
};
