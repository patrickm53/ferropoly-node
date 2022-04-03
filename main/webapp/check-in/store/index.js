/**
 * Store for the check-in
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.03.22
 **/
import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';
import map from '../../common/store/map';
import teamAccount from '../../lib/store/teamAccount';
import teams from '../../lib/store/teams';
import gameplay from '../../lib/store/gameplay';
import api from '../../lib/store/api';
import checkin from './modules/checkin';
import rankingList from '../../lib/store/rankingList';
import propertyRegister from '../../lib/store/propertyRegister';
import gameLog from '../../lib/store/gameLog';
import {get} from 'lodash';
import assignObject from '../../lib/assignObject';
import {GameProperties} from '../../lib/gameProperties';
import GameProperty from '../../lib/gameProperty';

Vue.use(Vuex);

const store = new Vuex.Store({
  state    : {
    gameDataLoaded: false, // becomes true when static data was loaded
    gameId        : undefined,
  },
  modules  : {map, teamAccount, gameplay, api, teams, checkin, rankingList, propertyRegister, gameLog},
  getters  : {getField},
  mutations: {updateField},
  actions  : {
    /**
     * Fetches the static data of a game, called once, when loading the page.
     * @param state
     * @param commit
     * @param rootState
     * @param options
     * @param dispatch
     */
    fetchStaticData({state, commit, rootState, dispatch}, options) {
      if (options.err) {
        console.error(options.err);
        state.api.error.message  = options.err;
        state.api.error.infoText = 'Es gab einen Fehler beim Laden der Spieldaten:';
        state.api.error.active   = true;
        return;
      }
      state.api.authToken = get(options.data, 'authToken', 'none');
      state.api.socketUrl = get(options.data, 'socketUrl', '/');
      state.gameId        = options.data.currentGameId;
      assignObject(state, options.data, 'gameplay');
      assignObject(state.checkin, options.data, 'team');
      // Init teams, assign indexes to them, also create associated tables in other store modules
      dispatch('teams/init', options.data.teams);
      dispatch('initTeamAccounts', state.teams.list);

      // Properties
      state.propertyRegister.properties = new GameProperties({gameplay: options.data.gameplay});
      options.data.pricelist.forEach(p => {
        state.propertyRegister.register.pushProperty(new GameProperty(p));
      })

      // Properties -> Map settings
      dispatch('setMapBounds', state.propertyRegister.register.properties);

      state.gameDataLoaded = true;
    },
    /**
     * Updates properties on application level
     * @param state
     * @param dispatch
     * @param options
     */
    updateProperties({state, dispatch}, options) {
      dispatch('propertyRegister/updateProperties', {gameId: state.gameId, teamId: state.checkin.team.uuid})
        .then(() => {
        })
        .catch(err => {
          state.api.error = err;
        });
    },
    /**
     * Updating the team account entries on application level => here only for the current team!
     * @param state
     * @param dispatch
     */
    updateTeamAccountEntries({state, dispatch}) {
      console.log('updateTeamAccountEntries', state)
      dispatch('loadTeamAccountEntries', {gameId: state.gameId, teamId: state.checkin.team.uuid})
        .then(() => {
        })
        .catch(err => {
          state.api.error = err;
        })
    },
  }
});

export default store;
