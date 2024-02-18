/**
 * Store for the game info
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 24.10.21
 **/

import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';
import $ from 'jquery';
import PricelistProperty from '../components/lib/pricelistProperty';
import {GameProperties} from '../../lib/gameProperties';
import GameProperty from '../../lib/gameProperty';
import map from '../../common/store/map'

Vue.use(Vuex);


const store = new Vuex.Store({
  modules  : {map},
  state    : {
    gameplay        : {
      owner     : {},
      scheduling: {},
      internal  : {},
      rules     : {
        text: '<em>not yet</em>'
      }
    },
    pricelist       : [],
    register        : new GameProperties(),
    teams           : [],
    mapOptions      : {
      center: {
        lat: 46.6,
        lng: 8.5
      },
      zoom  : 10
    },
    selectedProperty: null
  },
  getters  : {getField},
  mutations: {updateField},
  actions  : {
    /**
     * Get all infos needed
     * @param state
     * @param commit
     * @param rootState
     * @param options
     */
    fetchData({state, commit, rootState, dispatch}, options) {
      $.ajax(`/info/data/${options.gameId}`, {dataType: 'json'})
        .done(function (data) {
          console.log(data);
          state.gameplay   = data.gameplay;
          state.pricelist  = [];
          state.teams      = data.teams;
          state.register = new GameProperties({gameplay: data.gameplay});
          data.pricelist.forEach(p => {
            state.pricelist.push(new PricelistProperty(p));
            state.register.pushProperty(new GameProperty(p));
          });
          // Properties -> Map settings
          dispatch('setMapBounds', state.register.properties);

        })
        .fail(function (err) {
          console.error(err);
        });
    },
    /**
     * Update all markers
     * @param state
     * @param commit
     * @param rootState
     */
    updateMarkers({state, commit, rootState}) {
      console.log('Updating markers', state.pricelist.length);
      state.register.showAllPropertiesOnMap(state.map.instance);
    },
    /**
     * Select a property, bring it to front
     * @param state
     * @param commit
     * @param rootState
     * @param options
     */
    selectProperty({state, commit, rootState}, options) {
      if (state.selectedProperty) {
        state.selectedProperty.setMarkerIcon(false);
      }
      state.selectedProperty = options.property;
      state.selectedProperty.setMarkerIcon(true);
    },
  }
});

export default store;

