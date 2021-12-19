/**
 * Reception store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 28.11.21
 **/
import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';
import {get, forIn, isPlainObject, set} from 'lodash';
import gameplay from './modules/gameplay';
import pricelist from './modules/pricelist';
import propertyAccount from './modules/propertyAccount';
import rankingList from './modules/rankingList';
import teamAccount from './modules/teamAccount';
import teams from './modules/teams';
import travelLog from './modules/travelLog';

Vue.use(Vuex);

/**
 * Assigns the members of an object step by step to the state object with the same path
 * @param state
 * @param obj
 * @param name
 */
function assignObject(state, obj, name) {
  let src = get(obj, name, undefined);
  if (isPlainObject(src)) {
    forIn(src, (val, key) => {
      assignObject(state, obj, `${name}.${key}`);
    })
  } else {
    console.log('set', name, get(obj, name));
    set(state, name, get(obj, name, undefined));
  }
}

const store = new Vuex.Store({
  state    : {
    gameDataLoaded: false, // becomes true when static data was loaded
    panel         : 'panel-overview', // panel displayed
    gameId        : 'none',
    authToken     : 'none',
    socketUrl     : '/none',
    online        : false,
    api           : {
      error         : {
        active  : false,
        infoText: '',
        message : ''
      },
      requestPending: false
    }
  },
  modules  : {gameplay, pricelist, propertyAccount, rankingList, teamAccount, teams, travelLog},
  getters  : {
    getField
  },
  mutations: {
    updateField,
    // Socket.io connection is here
    connected(state) {
      state.online = true;
    },
    // socket.io connection has gone
    disconnected(state) {
      state.online = false;
    }
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
      if (options.err) {
        console.error(options.err);
        state.api.error.message  = options.err;
        state.api.error.infoText = 'Es gab einen Fehler beim Laden der Spieldaten:';
        state.api.error.active   = true;
        return;
      }
      state.authToken = get(options.data, 'authToken', 'none');
      state.socketUrl = get(options.data, 'socketUrl', '/');
      state.gameId    = options.data.currentGameId;
      assignObject(state, options.data, 'gameplay');
      // Init teams, assign indexes to them, also create associated tables in other store modules
      let i = 1;
      options.data.teams.forEach(t => {
        t.index = i;
        t.internalName = 'team' +  i.toLocaleString('de-ch', {minimumIntegerDigits: 2, useGrouping:false});
        state.teams.list.push(t);
        // Team account needs this mapping for speeding things up
        state.teamAccount.id2accounts[t.uuid] = t.internalName;
        i++;
      });
      console.log('teams', state.teams, state.teamAccount);
      state.gameDataLoaded = true;
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
