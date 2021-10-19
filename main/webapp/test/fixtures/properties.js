/**
 * Fixture for properties
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 31.07.21
 **/

import gameInfo from './edit-gameplay.json';
import {slice} from 'lodash';

function getGameplay() {
  return gameInfo.gameplay;
}

function getProperties(nb = 5000) {
  let nbOfProperties = Math.min(nb, gameInfo.properties.length);
  return slice(gameInfo.properties, 0, nbOfProperties);
}

function getOrdererdProperties(nb = 5000) {
  let i              = 0;
  let nbOfProperties = Math.min(nb, gameInfo.properties.length);
  let props          = slice(gameInfo.properties, 0, nbOfProperties);
  props.forEach(p => {
    p.pricelist.positionInPriceRange = i++;
  });
  return props;
}


export {getGameplay, getProperties, getOrdererdProperties};
