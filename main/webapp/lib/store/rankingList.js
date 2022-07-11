/**
 * Team Account module for the store with the ranking list
 *
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

/**
 * Creates the ranking list out of the received data
 * @param state
 * @param ranking
 * @param getters
 */
function createRankingList(state, ranking, getters) {
  state.list = [];
  ranking.forEach(t => {
    let team = getters['teams/teamById'](t.teamId);
    if (!team) {
      console.log('Team not found', t.teamId);
      return;
    }
    t.name  = team.name;
    t.color = team.color;
    state.list.push(t);
  });
}

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
     * @param getters
     * @param options has to contain the gameId
     * @returns promise
     */
    loadRankingList({state, getters}, options) {
      // My first promise... a bit special when being more familiar with callbacks... ;-)
      return new Promise((resolve, reject) => {
        if (!options.gameId) {
          console.log('GameId not loaded yet, wait for ranking list');
          return reject({active: false});
        }

        if (state.nextUpdate > DateTime.now() && !options.forcedUpdate) {
          console.log('Not yet time to load', state.nextUpdate.toISOTime());
          return reject({active: false});
        }
        state.nextUpdate = DateTime.now().plus({seconds: 30});

        axios.get(`/statistics/rankingList/${options.gameId}`)
          .then(resp => {
            let ranking = resp.data.ranking;
            console.log('Building ranking list', resp.data);
            createRankingList(state, ranking, getters);
            return resolve(state.list);
          })
          .catch(err => {
            console.error(err);
            return reject({
              message : get(err, 'response.data.message', null) || err.message,
              infoText: 'Es gab einen Fehler beim Laden der Rangliste:',
              active  : true
            });
          })
      });
    },
    /**
     * This saves the ranking list received directly (summary app)
     * @param state
     * @param getters
     * @param options
     */
    saveRankingList({state, getters}, options) {
      let ranking = options.ranking;
      createRankingList(state, ranking, getters);
    }
  }

};

export default module;
