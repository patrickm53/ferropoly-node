/**
 * Call store: everything about the current call
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import {assign} from 'lodash';
const {getCallField, updateCallField} = createHelpers({
  getterType  : 'getCallField',
  mutationType: 'updateCallField'
});

const module = {
  state    : () => ({
    currentTeam: {
      color: 'purple',
      uuid : 'none',
      data : {
        name: 'NONE'
      }
    },
    callActive : false
  }),
  getters  : {
    getCallField,
  },
  mutations: {
    updateCallField
  },
  actions  : {
    /**
     * Resets all data in the module for a new call
     * @param state
     * @param options
     */
    initCall({state}, options) {
      console.log('initating call', options);
      state.callActive  = true;
      assign(state.currentTeam, options.team);
    },
    finishCall({state}) {
      console.log('finishing call');
      state.callActive = false;
      state.currentTeam = {
        uuid : 'none',
        color: 'pink',
        data : {
          name: 'noni'
        }
      };
    }
  }

};

export default module;
