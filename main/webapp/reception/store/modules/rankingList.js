/**
 * Team Account module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import axios from 'axios';
import {get} from 'lodash';
const {getRankingListField, updateRankingListField} = createHelpers({
  getterType: 'getRankingListField',
  mutationType: 'updateRankingListField'
});

const module = {
  state: () => ({
    list: [ ]
  }),
  getters: {
    getRankingListField,
  },
  mutations: {
    updateRankingListField
  },
  actions: {
    /**
     * Loads the ranking list
     * @param state
     * @param commit
     * @param rootState
     */
    fetchRankingList({state, commit, rootState}) {
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
