/**
 * Team Account module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';

const {getTeamAccountField, updateTeamAccountField} = createHelpers({
  getterType: 'getTeamAccountField',
  mutationType: 'updateTeamAccountField'
});

const module = {
  state: () => ({

  }),
  getters: {
    getTeamAccountField,
  },
  mutations: {
    updateTeamAccountField
  }

};

export default module;
