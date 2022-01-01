/**
 * Team Account module for the store with the ranking list
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import axios from 'axios';
import {get} from 'lodash';
import {DateTime} from 'luxon';

const {getRankingListField, updateRankingListField} = createHelpers({
  getterType  : 'getRankingListField',
  mutationType: 'updateRankingListField'
});

const module = {
  state    : () => ({
    list      : [],
    nextUpdate: DateTime.now()
  }),
  getters  : {
    getRankingListField,
  },
  mutations: {
    updateRankingListField
  },
  actions  : {
    /**
     * Loads the ranking list, has a mechanism included to avoid loading it too often
     * @param state
     * @param commit
     * @param rootState
     * @param options
     */
    fetchRankingList({state, commit, rootState}, options) {
      if (!rootState.gameDataLoaded) {
        console.log('Game not loaded yet, wait for ranking list');
        return;
      }
      if (rootState.panel !== 'panel-overview') {
        // console.log('wrong panel, not loading ranking list');
        return;
      }
      if (state.nextUpdate > DateTime.now() && !options.forcedUpdate) {
        console.log('Not yet time to load', state.nextUpdate.toISOTime());
        return;
      }
      state.nextUpdate = DateTime.now().plus({seconds: 30});
      axios.get(`/statistics/rankingList/${rootState.gameId}`)
        .then(resp => {
          console.log('Building ranking list', resp.data);
          state.list = [];
          resp.data.ranking.forEach(t => {
            t.name = this.getters.teamIdToTeamName(t.teamId);
            state.list.push(t);
          });
        })
        .catch(err => {
          console.error(err);
          rootState.api.error.message  = get(err, 'response.data.message', null) || err.message
          rootState.api.error.infoText = 'Es gab einen Fehler beim Laden der Rangliste:';
          rootState.api.error.active   = true;
        })
    }
  }

};

export default module;
