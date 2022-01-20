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
  },
  actions: {
    /**
     * Updates the travel log for one team
     * @param state
     * @param options
     */
    updateTravelLog({state}, options) {
      console.warn('TravelLog is not implemented yet');
    },
  }

};

export default module;
