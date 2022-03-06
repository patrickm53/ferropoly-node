/**
 * Teams module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import {result, find, sortBy} from 'lodash';
import {Team} from '../team';

const {getTeamField, updateTeamField} = createHelpers({
  getterType  : 'getTeamField',
  mutationType: 'updateTeamField'
});

const module = {
  state    : () => ({
    list: [] // is an array of Team objects
  }),
  getters  : {
    getTeamField,
    /**
     * Converts a teamId to the name of the team
     * @param state
     * @returns {function(*): unknown}
     */
    teamIdToTeamName: (state) => (id) => {
      return result(find(state.list, {uuid: id}), 'data.name');
    },
    /**
     * Returns the internal name of a team
     * @param state
     * @returns {function(*): unknown}
     */
    teamIdToInternalName: (state) => (id) => {
      return result(find(state.list, {uuid: id}), 'internalName');
    },
    /**
     * Returns the internal (frontend internal) index of a team
     * @param state
     * @returns {function(*): unknown}
     */
    teamIdToIndex: (state) => (id) => {
      return result(find(state.list, {uuid: id}), 'index');
    },
    teamColor: (state) => (id) => {
      return result(find(state.list, {uuid: id}), 'color');
    }
  },
  mutations: {
    updateTeamField
  },
  actions: {
    /**
     * Init the teams during startup
     * @param state
     * @param teams is the array with all teams
     */
    initTeams({state}, teams) {
      let i     = 1;
      let sortedTeams = sortBy(teams, 'data.name');
      console.log('SORTING', teams, state.list);
      sortedTeams.forEach(t => {
        state.list.push(new Team(t, i));
        i++;
      });
    }
  }

};

export default module;
