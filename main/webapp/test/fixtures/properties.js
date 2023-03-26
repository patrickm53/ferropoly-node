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
  let nbOfProperties = Math.min(nb, gameInfo.pricelist.length);
  return slice(gameInfo.pricelist, 0, nbOfProperties);
}

function getOrdererdProperties(nb = 5000) {
  let i              = 0;
  let nbOfProperties = Math.min(nb, gameInfo.pricelist.length);
  let props          = slice(gameInfo.pricelist, 0, nbOfProperties);
  props.forEach(p => {
    p.pricelist.positionInPriceRange = i++;
  });
  return props;
}

function getPropertyByIndex(index) {
  return gameInfo.pricelist[index % gameInfo.pricelist.length];
}


export {getGameplay, getProperties, getOrdererdProperties, getPropertyByIndex};
