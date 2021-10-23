/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 23.10.21
 **/

import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';
import {readGamePlays} from '../adapter/gameplays';
import {readUserInfo} from '../adapter/userInfo';
import {sortBy} from 'lodash';

Vue.use(Vuex);


const storeGameSelector = new Vuex.Store({
  state    : {
    games          : [],
    gameplays      : [],
    userDisplayName: ''
  },
  getters  : {getField},
  mutations: {updateField},
  actions  : {
    /**
     * Get all games of the user
     * @param state
     * @param commit
     * @param rootState
     * @param options
     */
    fetchGames({state, commit, rootState}, options) {
      function formatDataInGps(gps) {
        gps.forEach(gp => {
          gp.scheduling.gameDate = new Date(gp.scheduling.gameDate);
          gp.scheduling.deleteTs = new Date(gp.scheduling.deleteTs);
        });
      }

      readGamePlays((err, info) => {
        if (!err) {
          // Bring data to the right form
          formatDataInGps(info.games);
          formatDataInGps(info.gameplays);
          state.games     = sortBy(info.games, ['scheduling.gameDate']);
          state.gameplays = sortBy(info.gameplays, ['scheduling.gameDate']);
        }
      });
    },
    /**
     * Read the name of the user
     * @param state
     * @param commit
     * @param rootState
     * @param options
     */
    fetchUserData({state, commit, rootState}, options) {
      readUserInfo((err, info) => {
        if (!err) {
          state.userDisplayName = info.personalData.forename;
        }
      });
    }
  }
});

export default storeGameSelector;
