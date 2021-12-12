/**
 * Team Account module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';

const {getRankingListField, updateRankingListField} = createHelpers({
  getterType: 'getRankingListField',
  mutationType: 'updateRankingListField'
});

const module = {
  state: () => ({

  }),
  getters: {
    getRankingListField,
  },
  mutations: {
    updateRankingListField
  }

};

export default module;
