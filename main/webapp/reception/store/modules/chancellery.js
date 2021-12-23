/**
 * Chancellery Store file
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 23.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import axios from 'axios';
import {get, sumBy, filter} from 'lodash';

const {getChancelleryField, updateChancelleryField} = createHelpers({
  getterType  : 'getChancelleryField',
  mutationType: 'updateChancelleryField'
});

const module = {
  state    : () => ({
    list: []
  }),
  getters  : {
    getChancelleryField,
    asset(state) {
      return sumBy(state.list, 'transaction.amount');
    },
    /**
     * List chancellery entries by team
     * @param state
     * @returns {function(*): unknown[]}
     */
    listByTeam: (state) => (id) => {
      return filter(state.list, function (n) {
        return n.transaction.origin.uuid === id;
      });
    }
  },
  mutations: {
    updateChancelleryField
  },
  actions  : {
    updateChancellery({state, rootState}) {
      if (rootState.panel !== 'panel-chancellery') {
        return;
      }
      axios.get(`/chancellery/account/statement/${rootState.gameId}`)
        .then(resp => {
          console.log('Chancellery read', resp.data);
          state.list = resp.data.entries;
        })
        .catch(err => {
          console.error(err);
          rootState.api.error.message  = get(err, 'response.data.message', null) || err.message
          rootState.api.error.infoText = 'Es gab einen Fehler beim Laden der Chance/Kanzlei Daten:';
          rootState.api.error.active   = true;
        })
    }
  }
};

export default module;
