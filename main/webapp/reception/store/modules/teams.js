/**
 * Teams module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import {result, find} from 'lodash';

const {getTeamField, updateTeamField} = createHelpers({
  getterType  : 'getTeamField',
  mutationType: 'updateTeamField'
});

const module = {
  state    : () => ({
    list: []
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
    }
  },
  mutations: {
    updateTeamField
  }

};

export default module;
