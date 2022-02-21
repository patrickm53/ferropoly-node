/**
 * Some generic things for properties
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 21.02.22
 **/

import {get} from 'lodash';

/**
 * Evaluates the value of a property
 * @param property
 * @param houses
 * @returns {number}
 */
function evaluatePropertyValue(property, houses) {
  switch(houses) {
    case 0:
      return get(property, 'pricelist.rents.noHouse', 0);
    case 1:
      return get(property, 'pricelist.rents.oneHouse', 0);
    case 2:
      return get(property, 'pricelist.rents.twoHouses', 0);
    case 3:
      return get(property, 'pricelist.rents.threeHouses', 0);
    case 4:
      return get(property, 'pricelist.rents.fourHouses', 0);
    case 5:
      return get(property, 'pricelist.rents.hotel', 0);
    default:
      console.warn('well, that\'s just bullshit', houses);
      return 0;
  }
}

/**
 * Evaluates the current value of a property, according to the game state
 * @param property
 * @returns {number|number|*}
 */
function evaluateCurrentPropertyValue(property) {
  let houses = get(property, 'gamedata.buildings', -1);
  if (houses < 0) {
    return 0;
  }
  return evaluatePropertyValue(property, houses);
}


export {evaluatePropertyValue, evaluateCurrentPropertyValue};
