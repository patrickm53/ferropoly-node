/**
 * Travel Log module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';

const {getTravelLogField, updateTravelLogField} = createHelpers({
  getterType: 'getTravelLogField',
  mutationType: 'updateTravelLogField'
});

const module = {
  state: () => ({

  }),
  getters: {
    getTravelLogField,
  },
  mutations: {
    updateTravelLogField
  }

};

export default module;
