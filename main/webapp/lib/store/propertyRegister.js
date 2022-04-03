/**
 * Properties module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import axios from 'axios';
import GameProperty from '../gameProperty';
import {GameProperties} from '../gameProperties';
import {get} from 'lodash';

const {getPricelistField, updatePricelistField} = createHelpers({
  getterType  : 'getPricelistField',
  mutationType: 'updatePricelistField'
});

const module = {
  namespaced: true,
  state     : () => ({
    register: new GameProperties()
  }),
  getters   : {
    getPricelistField,
    /**
     * Returns the property data by providing its id
     * @param state
     * @returns {function(*): unknown}
     */
    getPropertyById: (state) => (id) => {
      return state.register.getPropertyById(id);
    },
    /**
     * Returns the properties of a team
     * @param state
     * @returns {function(*): number}
     */
    getPropertiesForTeam: (state) => (teamId) => {
      return state.register.getPropertiesOfTeam(teamId);
    },
    /**
     * Returns the number of properties of a team
     * @param state
     * @returns {function(*): number}
     */
    getNbOfPropertiesOfTeam: (state)=>(teamId)=>{
      return state.register.getNbOfPropertiesOfTeam(teamId);
    },
    /**
     * Returns the value of a property
     * @param state
     * @returns {function(*): number}
     */
    getPropertyValue: (state) => (property) => {
      return state.register.evaluatePropertyValue(property);
    }
  },
  mutations : {
    updatePricelistField
  },
  actions   : {
    /**
     * Updates a property in the list
     * @param state
     * @param options
     */
    updatePropertyInPricelist({state}, options) {
      let property = new GameProperty(get(options, 'property', null));
      console.log('updatePropertyInPricelist', property, options.property);
      if (property && property.uuid) {
        state.register.updateProperty(property);
      }
    },
    /**
     * It is allowed again to build buildings
     * @param state
     */
    buildingAllowedAgain({state}) {
      state.register.enableBuilding();
    },

    /**
     * Updates properties, all or only for a user
     * @param state
     * @param commit
     * @param options teamId: id of the team or undefined for all
     * @returns {Promise<unknown>}
     */
    updateProperties({state, commit}, options) {
      return new Promise((resolve, reject) => {
        let teamId = get(options, 'teamId', 'undefined');
        axios.get(`/properties/get/${options.gameId}/${teamId}`)
          .then(resp => {
            resp.data.properties.forEach(p => {
              let property = new GameProperty(p);
              state.register.updateProperty(property);
            });
            console.log('Properties read', resp.data, state.register);
            return resolve();
          })
          .catch(err => {
            console.error(err);
            return reject({
              message : get(err, 'response.data.message', null) || err.message,
              infoText: 'Es gab einen Fehler beim Laden der Ortsdaten:',
              active  : true
            });
          })
      })
    }
  }
};

export default module;
