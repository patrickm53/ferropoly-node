/**
 * Properties module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import axios from 'axios';
import GameProperty from '../../../lib/gameProperty';
import {GameProperties} from '../../../lib/gameProperties';
import {get} from 'lodash';

const {getPricelistField, updatePricelistField} = createHelpers({
  getterType  : 'getPricelistField',
  mutationType: 'updatePricelistField'
});

const module = {
  state    : () => ({
    register: new GameProperties()
  }),
  getters  : {
    getPricelistField,
    /**
     * Returns the property data by providing its id
     * @param state
     * @returns {function(*): unknown}
     */
    getPropertyById: (state) => (id) => {
      return state.register.getPropertyById(id);
    }
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
      let property = new GameProperty(get(options, 'property', null));
      console.log('updatePropertyInPricelist', property, options.property);
      if (property && property.uuid) {
        state.register.updateProperty(property);
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
      let teamId = get(options, 'teamId', 'undefined');
      axios.get(`/properties/get/${rootState.gameId}/${teamId}`)
        .then(resp => {
          resp.data.properties.forEach(p => {
            let property = new GameProperty(p);
            state.register.updateProperty(property);
          });
          console.log('Properties read', resp.data, state.list);
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
