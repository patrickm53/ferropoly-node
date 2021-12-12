/**
 * Pricelist module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';

const {getPricelistField, updatePricelistField} = createHelpers({
  getterType: 'getPricelistField',
  mutationType: 'updatePricelistField'
});

const module = {
  state: () => ({

  }),
  getters: {
    getPricelistField,
  },
  mutations: {
    updatePricelistField
  }

};

export default module;
