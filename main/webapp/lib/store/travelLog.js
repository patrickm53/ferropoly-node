/**
 * Travel Log module for the store
 *
 * This module REQUIRES TEAMS and PROPERTY-REGISTER module to be present!
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import axios from 'axios';
import {get, forOwn} from 'lodash';
import TeamTrack from '../teamTrack';

const {getTravelLogField, updateTravelLogField} = createHelpers({
  getterType  : 'getTravelLogField',
  mutationType: 'updateTravelLogField'
});

const module = {
  namespaced: true,
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
     * @param options gameId must be supplied
     * @param rootGetters
     * @param getters
     */
    update({state, getters, rootGetters}, options) {
      const createEntry = function (tl) {
        let propertyId = get(tl, 'propertyId', null);
        let name;
        if (propertyId) {
          name = get(rootGetters['propertyRegister/getPropertyById'](propertyId), 'location.name', 'none');
        } else {
          name = `GPS: ${tl.position.lat}, ${tl.position.lng}`
        }
        return {
          lat       : tl.position.lat,
          lng       : tl.position.lng,
          ts        : tl.timestamp,
          name      : name,
          accuracy  : get(tl, 'position.accuracy', 10000),
          propertyId: get(tl, 'propertyId', null)
        };
      }

      return new Promise((resolve, reject) => {
        let teamId = get(options, 'teamUuid', undefined);
        axios.get(`/travellog/${options.gameId}/${teamId}`)
          .then(resp => {
            console.log('travelLog read', resp.data);
            if (!teamId) {
              // Create for each team a log (if not existing)
              console.log('TEAMS', getters['teams/getTeamList']);
              options.teams.forEach(t => {
                if (!state.log[t.uuid]) {
                  state.log[t.uuid] = new TeamTrack({
                    id   : t.uuid,
                    color: t.color,
                    name : t.name
                  });
                }
              })
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
                  color: rootGetters['teams/idToColor'](tl.teamId),
                  name : rootGetters['teams/idToTeamName'](tl.teamId)
                });
              }
              state.log[tl.teamId].pushLocation(createEntry(tl));
            });

            console.log('Travellog read', state.log);
            return resolve(state.log);
          })
          .catch(err => {
            console.error(err);
            return reject({
              message : get(err, 'response.data.message', null) || err.message,
              infoText: 'Es gab einen Fehler beim Laden des TravelLogs:',
              active  : true
            });
          })
      });
    },
  }

};

export default module;
