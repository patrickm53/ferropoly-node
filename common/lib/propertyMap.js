/**
 * This module creates a map which displays the values and possession of regions with different properties
 *
 * TODO: This module is neither finished nor tested, it's just a prototype!
 * 
 * Created by christian on 18.12.16.
 */
const propertyModel = require('../models/propertyModel');
const _             = require('lodash');

/**
 * Creates the map with the property values
 * @param options : gameId, squaresOnShortSide
 * @param callback
 */
function create(options, callback) {
  propertyModel.getPropertiesForGameplay(options.gameId, {lean: true}, (err, props) => {
    if (err) {
      return callback(err);
    }
    let boundary = calculateSquareParams(options, calculateBoundary(props));
    console.log(boundary);
    callback();
  });
}

/**
 * Calculates the boundaries (max and min of lat and lng)
 * @param props
 * @returns {{min: {lat: number, lng: number}, max: {lat: number, lng: number}}}
 */
function calculateBoundary(props) {
  let latMin = 90;
  let latMax = 0;
  let lngMin = 180;
  let lngMax = 0;

  props.forEach(p => {
    let lat = parseFloat(_.get(p, 'location.position.lat'));
    let lng = parseFloat(_.get(p, 'location.position.lng'));
    if (lat && lng) {
      latMin = _.min([latMin, lat]);
      lngMin = _.min([lngMin, lng]);
      latMax = _.max([latMax, lat]);
      lngMax = _.max([lngMax, lng]);
    }
  });
  return {min: {lat: latMin, lng: lngMin}, max: {lat: latMax, lng: lngMax}};
}

/**
 * Calculates the parameters for the squares which are used in the map afterwards
 * @param options
 * @param boundary
 * @returns {*}
 */
function calculateSquareParams(options, boundary) {
  let dLat = boundary.max.lat - boundary.min.lat;
  let dLng = boundary.max.lng - boundary.min.lng;

  // Make a border around them, not letting the properties being at the edge of the map
  let borderFactor = 0.03; // Percent of a side
  boundary.max.lat = boundary.max.lat + dLat * borderFactor;
  boundary.max.lng = boundary.max.lng + dLng * borderFactor;
  boundary.min.lat = boundary.min.lat + dLat * borderFactor;
  boundary.min.lng = boundary.min.lng + dLng * borderFactor;

  // Now calculate the size again
  dLat = boundary.max.lat - boundary.min.lat;
  dLng = boundary.max.lng - boundary.min.lng;


  let shortSide          = _.min([dLat, dLng]);
  let squaresOnShortSide = _.get(options, 'squaresOnShortSide', 4)
  let squareLength       = shortSide / squaresOnShortSide;

  let longSide          = _.max([dLat, dLng]);
  let squaresOnLongSide = _.ceil(longSide / squareLength);
  const correctionValue = ((squaresOnLongSide * squareLength) - longSide) / 2;

  let shortSideIsLng = dLat > dLng;
  let squaresOnLng   = 0;
  let squaresOnLat   = 0;
  if (shortSideIsLng) {
    boundary.min.lat -= correctionValue;
    boundary.max.lat += correctionValue;
    squaresOnLng = squaresOnShortSide;
    squaresOnLat = squaresOnLongSide;
  }
  else {
    boundary.min.lng -= correctionValue;
    boundary.max.lng += correctionValue;
    squaresOnLng = squaresOnLongSide;
    squaresOnLat = squaresOnShortSide;
  }

  let retVal = {
    squaresOnShortSide: squaresOnShortSide,
    squaresOnLongSide : squaresOnLongSide,
    squareLength      : squareLength,
    origin            : boundary.min
  };


  // Now calculate the lower left corner of each square
  for (let x = boundary.min.lat; x < boundary.max.lat; x += squareLength) {
    for (let y = boundary.min.lng; x < boundary.max.lng; x += squareLength) {
      console.log(x,y);
    }
  }

return retVal;
}

module.exports = {
  create: create
};