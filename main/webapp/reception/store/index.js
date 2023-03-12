/**
 * Reception store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 28.11.21
 **/
import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';
import {get} from 'lodash';
import gameplay from '../../lib/store/gameplay';
import api from '../../lib/store/api';
import propertyRegister from '../../lib/store/propertyRegister';
import propertyAccount from './modules/propertyAccount';
import rankingList from '../../lib/store/rankingList';
import teamAccount from '../../lib/store/teamAccount';
import picBucketStore from "../../lib/store/picBucketStore";
import teams from '../../lib/store/teams';
import travelLog from '../../lib/store/travelLog';
import chancellery from '../../lib/store/chancellery';
import gameLog from '../../lib/store/gameLog';
import call from './modules/call';
import map from '../../common/store/map';
import reception from './modules/reception';
import statistic from './modules/statistic';
import GameProperty from '../../lib/gameProperty';
import {GameProperties} from '../../lib/gameProperties';
import assignObject from '../../lib/assignObject';

Vue.use(Vuex);



const store = new Vuex.Store({
  state    : {
    gameDataLoaded: false, // becomes true when static data was loaded
    gameId        : undefined,
  },
  modules  : {
    gameplay,
    picBucketStore,
    propertyRegister,
    propertyAccount,
    rankingList,
    teamAccount,
    teams,
    travelLog,
    chancellery,
    call,
    map,
    api,
    reception,
    statistic,
    gameLog
  },
  getters  : {
    getField
  },
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
     * Loading the ranking list, application level
     * @param state
     * @param dispatch
     * @param options
     */
    fetchRankingList({state, dispatch}, options) {
      if (state.reception.panel !== 'panel-overview' && state.reception.panel !== 'panel-statistic') {
        //console.log('wrong panel, not loading ranking list');
        return;
      }

      dispatch('loadRankingList', {gameId: state.gameId, forcedUpdate: get(options, 'forcedUpdate', false)})
        .then(() => {
        })
        .catch(err => {
          state.api.error = err;
        })
    },
    /**
     * Updating the team account entries on application level
     * @param state
     * @param dispatch
     * @param options
     */
    updateTeamAccountEntries({state, dispatch}, options) {
      dispatch('loadTeamAccountEntries', {gameId: state.gameId, teamId: get(options, 'teamId', 'all')})
        .then(() => {
        })
        .catch(err => {
          state.api.error = err;
        })
    },
    /**
     * Updates properties on application level
     * @param state
     * @param dispatch
     * @param options
     */
    updateProperties({state, dispatch}, options) {
      dispatch('propertyRegister/updateProperties', {gameId: state.gameId, teamId: get(options, 'teamId', undefined)})
        .then(() => {
        })
        .catch(err => {
          state.api.error = err;
        });
    },
    /**
     * Updates the chancellery on application level
     * @param state
     * @param dispatch
     * @param options
     */
    updateChancellery({state, dispatch}, options) {
      if (state.reception.panel !== 'panel-chancellery') {
        return;
      }

      dispatch('chancellery/updateChancellery', {gameId: state.gameId})
        .then(() => {
        })
        .catch(err => {
          state.api.error = err;
        });
    },
    updateTravelLog({state, dispatch}, options) {
      dispatch('travelLog/update', {gameId: state.gameId,
        teams: state.teams.list,
        teamId: get(options, 'teamId', undefined)})
        .then(() => {
        })
        .catch(err => {
          console.log(err);
          state.api.error = err;
        });
    },

  }
});

export default store;
