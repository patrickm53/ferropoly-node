/**
 * Teams module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';

const {getTeamField, updateTeamField} = createHelpers({
  getterType: 'getTeamField',
  mutationType: 'updateTeamField'
});

const module = {
  state: () => ({

  }),
  getters: {
    getTeamField,
  },
  mutations: {
    updateTeamField
  }

};

export default module;
