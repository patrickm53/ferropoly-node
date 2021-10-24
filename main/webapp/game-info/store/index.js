/**
 * Store for the game info
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 24.10.21
 **/

/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 23.10.21
 **/

import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';
import $ from 'jquery';


Vue.use(Vuex);


const store = new Vuex.Store({
  state    : {
    gameplay : {
      owner: {}
    },
    pricelist: {},
    teams    : []
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
    fetchData({state, commit, rootState}, options) {
      $.ajax(`/info/data/${options.gameId}`, {dataType: 'json'})
        .done(function (data) {
          console.log(data);
          state.gameplay  = data.gameplay;
          state.pricelist = data.pricelist;
          state.teams     = data.teams;
        })
        .fail(function (err) {
          console.error(err);
        });
    },

  }
});

export default store;

