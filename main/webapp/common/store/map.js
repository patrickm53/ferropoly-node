/**
 * Store for map specific information
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 02.01.22
 **/

import {createHelpers} from 'vuex-map-fields';
import {maxBy, minBy} from 'lodash';

const {getMapField, updateMapField} = createHelpers({
  getterType  : 'getMapField',
  mutationType: 'updateMapField'
});

const module = {
  state  : () => ({
    center  : {
      lat: -1.0,
      lng: -1.0
    },
    bounds  : {
      north: 0,
      south: 0,
      east : 0,
      west : 0
    },
    zoom    : 10,
    instance: undefined, // the Google Map instance
  }),
  getters: {
    getMapField,
    /**
     * Returns the (arithmetical) center of the map
     * @param state
     * @returns {{lng: number, lat: number}}
     */
    getMapCenter: (state) => {
      if (state.center.lat < 0) {
        state.center.lat = state.bounds.south + (state.bounds.north - state.bounds.south) / 2;
        state.center.lng = state.bounds.west + (state.bounds.east - state.bounds.west) / 2;
        console.log('Map center evaluated', state.center, state.bounds);
      }
      return state.center;
    }
  },

  mutations: {
    updateMapField
  },
  actions  : {
    /**
     * Sets the bounds properties according to the list of properties
     * @param state
     * @param properties
     */
    setMapBounds({state}, properties) {
      state.bounds.north = parseFloat(maxBy(properties, p => {
        return parseFloat(p.location.position.lat);
      }).location.position.lat);
      state.bounds.south = parseFloat(minBy(properties, p => {
        return parseFloat(p.location.position.lat);
      }).location.position.lat);
      state.bounds.east  = parseFloat(maxBy(properties, p => {
        return parseFloat(p.location.position.lng);
      }).location.position.lng);
      state.bounds.west  = parseFloat(minBy(properties, p => {
        return parseFloat(p.location.position.lng);
      }).location.position.lng);
      console.log('bound set', state.bounds);
    }
  }
};

export default module;
