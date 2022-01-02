/**
 * Properties module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import {find, findIndex, get} from 'lodash';
import axios from 'axios';

const {getPricelistField, updatePricelistField} = createHelpers({
  getterType  : 'getPricelistField',
  mutationType: 'updatePricelistField'
});

const module = {
  state    : () => ({
    list: []
  }),
  getters  : {
    getPricelistField,
    /**
     * Returns the property data by providing its id
     * @param state
     * @returns {function(*): unknown}
     */
    getPropertyById: (state) => (id) => {
      return find(state.list, {uuid: id});
    },
  },
  mutations: {
    updatePricelistField
  },
  actions  : {
    /**
     * Updates a property in the list
     * @param state
     * @param commit
     * @param rootState
     * @param options
     */
    updatePropertyInPricelist({state, commit, rootState}, options) {
      let property = get(options, 'property', null);

      if (property && property.uuid) {
        let i = findIndex(state.list, {uuid: property.uuid});
        if (i > -1) {
          state.list[i] = property;
        }
      }
    },

    /**
     * Updates properties, all or only for a user
     * @param state
     * @param commit
     * @param rootState
     * @param options teamId: id of the team or undefined for all
     */
    updateProperties({state, commit, rootState}, options) {
      axios.get(`/properties/get/${rootState.gameId}/${options.teamId}`)
        .then(resp => {
          console.log('Building ranking list', resp.data);
          resp.data.properties.forEach(p=>{
            let i = findIndex(state.list, {uuid: p.uuid});
            if (i > -1) {
              state.list[i] = p;
            }
            else {
              console.error('Did not find property', p);
            }

          });
        })
        .catch(err => {
          console.error(err);
          rootState.api.error.message  = get(err, 'response.data.message', null) || err.message
          rootState.api.error.infoText = 'Es gab einen Fehler beim Laden der Ortsdaten:';
          rootState.api.error.active   = true;
        })
    }
  }

};

export default module;
