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
     * @param options has to contain the gameId
     * @returns promise
     */
    loadRankingList({state}, options) {
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
            console.log('Building ranking list', resp.data);
            state.list = [];
            resp.data.ranking.forEach(t => {
              let team = this.getters['teams/teamById'](t.teamId);
              if (!team) {
                console.log('Team not found', t.teamId);
                return;
              }
              t.name   = team.name;
              t.color  = team.color;
              state.list.push(t);
            });
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

    }
  }

};

export default module;
