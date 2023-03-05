/**
 * A store file for generic API access
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.03.22
 **/

import {createHelpers} from 'vuex-map-fields';

const {getApiField, updateApiField} = createHelpers({
  getterType  : 'getApiField',
  mutationType: 'updateApiField'
});

const api = {
  state    : () => ({
    error         : {
      active  : false,
      infoText: '',
      message : '',
    },
    authToken     : 'none',
    requestPending: false,
    socketUrl     : '/none',
    online        : false,
  }),
  getters  : {
    getApiField,
  },
  mutations: {
    updateApiField,
    // Socket.io connection is here
    connected(state) {
      state.online = true;
    },
    // socket.io connection has gone
    disconnected(state) {
      state.online = false;
    }
  },
  actions  : {
    /**
     * Resets the API error from the last call, used when closing the modal dialog
     * @param state
     */
    resetApiError(state) {
      console.log('resetting api error');
      state.error.active   = false;
      state.error.infoText = '';
      state.error.message  = '';
    },
  }
}

export default api;
