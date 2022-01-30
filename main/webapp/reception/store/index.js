/**
 * Reception store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 28.11.21
 **/
import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';
import {get, forIn, isPlainObject, set, sortBy} from 'lodash';
import gameplay from './modules/gameplay';
import properties from './modules/properties';
import propertyAccount from './modules/propertyAccount';
import rankingList from './modules/rankingList';
import teamAccount from './modules/teamAccount';
import teams from './modules/teams';
import travelLog from './modules/travelLog';
import chancellery from './modules/chancellery';
import call from './modules/call';

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
    menuElements  : [
      {title: 'Übersicht', href: '#', event: 'panel-change', eventParam: 'panel-overview', active: true},
      {title: 'Anruf behandeln', href: '#', event: 'panel-change', eventParam: 'panel-call', active: false},
      {title: 'Karte', href: '#', event: 'panel-change', eventParam: 'panel-map', active: false},
      {title: 'Statistik', href: '#', event: 'panel-change', eventParam: 'panel-statistic', active: false},
      {title: 'Kontobuch', href: '#', event: 'panel-change', eventParam: 'panel-accounting', active: false},
      {title: 'Chance/Kanzlei', href: '#', event: 'panel-change', eventParam: 'panel-chancellery', active: false},
      {title: 'Preisliste', href: '#', event: 'panel-change', eventParam: 'panel-properties', active: false},
      {title: 'Spielregeln', href: '#', event: 'panel-change', eventParam: 'panel-rules', active: false}
    ],
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
  modules  : {gameplay, properties, propertyAccount, rankingList, teamAccount, teams, travelLog, chancellery, call},
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
    },
    setPanel(state, panel) {
      console.log('changing Panel', panel);
      state.menuElements.forEach(e => {
        e.active = (e.eventParam === panel);
      })
      state.panel = panel;
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
      let i     = 1;
      let teams = sortBy(options.data.teams, 'data.name');
      console.log('SORTING', teams, options.data.teams);
      teams.forEach(t => {
        t.index        = i;
        t.internalName = 'team' + i.toLocaleString('de-ch', {minimumIntegerDigits: 2, useGrouping: false});
        state.teams.list.push(t);
        // Team account needs this mapping for speeding things up
        state.teamAccount.id2accounts[t.uuid] = t.internalName;
        i++;
      });
      // Properties
      state.properties.list = options.data.pricelist;

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
