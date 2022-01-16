/**
 * Call store: everything about the current call
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';

const {getCallField, updateCallField} = createHelpers({
  getterType: 'getCallField',
  mutationType: 'updateCallField'
});

const module = {
  state: () => ({
    currentTeam: undefined, // uuid of the team
    callActive: false
  }),
  getters: {
    getCallField,
  },
  mutations: {
    updateCallField
  }

};

export default module;
