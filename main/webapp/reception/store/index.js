/**
 * Reception store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 28.11.21
 **/
import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';
import {get} from 'lodash';
import axios from 'axios';
import gameplay from './modules/gameplay';
import pricelist from './modules/pricelist';
import propertyAccount from './modules/propertyAccount';
import rankingList from './modules/rankingList';
import teamAccount from './modules/teamAccount';
import teams from './modules/teams';
import travelLog from './modules/travelLog';

Vue.use(Vuex);

const store = new Vuex.Store({
  state    : {
    panel    : 'panel-overview', // panel displayed
    gameId   : 'none',
    authToken: 'none',
    socketUrl: '/none',
    api      : {
      error         : {
        active  : false,
        infoText: '',
        message : ''
      },
      requestPending: false
    }
  },
  modules  : {gameplay, pricelist, propertyAccount, rankingList, teamAccount, teams, travelLog},
  getters  : {getField},
  mutations: {
    updateField
  },
  actions  : {
    /**
     * Fetches the static data of a game, called once, when loading the page.
     * @param state
     * @param commit
     * @param rootState
     * @param options
     */
    fetchStaticData({state, commit, rootState}, options) {
      state.api.requestPending = true;
      axios.get(`/reception/static/${options.gameId}`)
        .then(resp => {
          console.log(resp.data);
          state.authToken = get(resp.data, 'authToken', 'none');
          state.socketUrl = get(resp.data, 'socketUrl', '/');
          state.gameId    = resp.data.currentGameId;
        })
        .catch(err => {
          console.log('xx', err.toJSON());
          console.log(err.response.data);
          state.api.error.message  = get(err, 'response.data.message', null) || err.message;
          state.api.error.infoText = 'Es gab einen Fehler beim Laden der Spieldaten:';
          state.api.error.active   = true;
        })
        .then(() => {
          state.api.requestPending = false;
        })
    },
    /**
     * Resets the API error from the last call, used when closing the modal dialog
     * @param state
     */
    resetApiError(state) {
      console.log('resetting api error');
      state.api.error.active   = false;
      state.api.error.infoText = '';
      state.api.error.message  = '';
    },
  }

});

export default store;
