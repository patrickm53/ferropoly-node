/**
 * Travel Log module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import axios from 'axios';
import {get, forOwn} from 'lodash';
import TeamTrack from '../../../lib/teamTrack';

const {getTravelLogField, updateTravelLogField} = createHelpers({
  getterType  : 'getTravelLogField',
  mutationType: 'updateTravelLogField'
});

const module = {
  state    : () => ({
    log: {}
  }),
  getters  : {
    getTravelLogField,
    teamLog: (state) => (id) => {
      return state.log[id];
    }
  },
  mutations: {
    updateTravelLogField
  },
  actions  : {
    /**
     * Updates the travel log for one team
     * @param state
     * @param options
     * @param rootState
     * @param getters
     */
    updateTravelLog({state, rootState, getters}, options) {
      const createEntry = function (tl) {
        return {
          lat: tl.position.lat,
          lng: tl.position.lng,
          ts : tl.timestamp
        };
      }
      let teamId        = get(options, 'teamUuid', undefined);
      axios.get(`/travellog/${rootState.gameId}/${teamId}`)
        .then(resp => {
          console.log('travelLog read', resp.data);
          if (!teamId) {
            // Returns all entries, clear existing ones
            forOwn(state.log, (val, key) => {
              state.log[key].clear();
            })
          }

          resp.data.travelLog.forEach(tl => {
            if (!state.log[tl.teamId]) {
              // Create new track for a team if it does not already exist
              state.log[tl.teamId] = new TeamTrack({
                id   : tl.teamId,
                color: getters.teamColor(tl.teamId)
              });
            }
            state.log[tl.teamId].pushLocation(createEntry(tl));
          });

          console.log('Travellog read', state.log);
        })
        .catch(err => {
          console.error(err);
          rootState.api.error.message  = get(err, 'response.data.message', null) || err.message
          rootState.api.error.infoText = 'Es gab einen Fehler beim Laden des TravelLogs:';
          rootState.api.error.active   = true;
        })
    },
  }

};

export default module;
