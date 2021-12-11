/**
 * Reception store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 28.11.21
 **/
import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';

Vue.use(Vuex);

const store = new Vuex.Store({
  state    : {
    panel : 'panel-overview', // panel displayed
    gameId: 'none'
  },
  getters  : {getField},
  mutations: {
    updateField
  },
  actions  : {}

});

export default store;
