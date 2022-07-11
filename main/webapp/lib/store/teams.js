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
  namespaced: true,
  state     : () => ({
    list: [] // is an array of Team objects
  }),
  getters   : {
    getTeamField,
    getTeamList(state) {
      return state.list;
    },
    /**
     * Converts a teamId to the name of the team
     * @param state
     * @returns {function(*): unknown}
     */
    idToTeamName: (state) => (id) => {
      return result(find(state.list, {uuid: id}), 'data.name');
    },
    /**
     * Returns the team by its ID
     * @param state
     * @returns {function(*): unknown}
     */
    teamById: (state) => (id) => {
      console.log('Requesting', id, state.list);
      return find(state.list, {uuid: id});
    },
    /**
     * Returns the color of a team by its ID
     * @param state
     * @returns {function(*): unknown}
     */
    idToColor: (state) => (id) => {
      return result(find(state.list, {uuid: id}), 'color');
    },
    /**
     * Returns the number of teams
     * @param state
     * @returns {number}
     */
    numberOfTeams: (state) => {
      return state.list.length;
    }
  },
  mutations : {
    updateTeamField
  },
  actions   : {
    /**
     * Init the teams during startup
     * @param state
     * @param teams is the array with all teams
     */
    init({state}, teams) {
      let i           = 1;
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
