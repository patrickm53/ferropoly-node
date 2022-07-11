/**
 * Map types of the Ferropoly
 */

import mapData from '../../../../common/lib/maps.json';
import {find} from 'lodash';

/**
 * Return all map types
 * @returns {{}}
 */
function getMapTypes() {
  return mapData.maps;
}

/**
 * Converts the generic JSON to a Bootstrap Vue compatible format
 */
function getMapTypesForUi() {
  let retVal = [];
  mapData.maps.forEach(m => {
    if (m.enabled) {
      retVal.push({html: `<b>${m.name}</b>: ${m.description}`, value: m.map});
    }
  });
  return retVal;
}

/**
 * Returns the name of the map fitting to the ID
 * @param id
 */
function getMapName(id) {
  let info = find(mapData.maps, {map: id});
  if (!info) {
    return 'unbekannt !';
  }
  return info.name;
}

/**
 * Returns the default map
 * @returns {string}
 */
function getDefaultMap() {
  return 'zvv';
}

export {getDefaultMap, getMapTypes, getMapTypesForUi, getMapName};
