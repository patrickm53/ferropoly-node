/**
 * Property Account module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';

const {getPropertyAccountField, updatePropertyAccountField} = createHelpers({
  getterType: 'getPropertyAccountField',
  mutationType: 'updatePropertyAccountField'
});

const module = {
  state: () => ({

  }),
  getters: {
    getPropertyAccountField,
  },
  mutations: {
    updatePropertyAccountField
  }

};

export default module;
