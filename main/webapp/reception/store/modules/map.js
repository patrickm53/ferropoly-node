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
  state    : () => ({
    center: {
      lat: -1.0,
      lng: -1.0
    }
  }),
  getters  : {
    getMapField,
    getMapCenter: (state, getters, rootState) => {
      if (state.center.lat < 0) {
        let latMax = maxBy(rootState.properties.list, 'location.position.lat');
        let latMin = minBy(rootState.properties.list, 'location.position.lat');
        let lngMax = maxBy(rootState.properties.list, 'location.position.lng');
        let lngMin = minBy(rootState.properties.list, 'location.position.lng');

        state.center.lat = parseFloat(latMin.location.position.lat) + (parseFloat(latMax.location.position.lat) - parseFloat(latMin.location.position.lat)) / 2;
        state.center.lng = parseFloat(lngMin.location.position.lng) + (parseFloat(lngMax.location.position.lng) - parseFloat(lngMin.location.position.lng)) / 2;
        console.log('Map center evaulated', state.center);
      }
      return state.center;
    }
  },
  mutations: {
    updateMapField
  }

};

export default module;
