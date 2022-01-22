/**
 * Call store: everything about the current call
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import {assign} from 'lodash';
import {DateTime} from 'luxon';

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
    callActive : false,
    log        : []
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
      state.callActive = true;
      assign(state.currentTeam, options.team);
    },
    /**
     * Finishes a call
     * @param state
     */
    finishCall({state}) {
      console.log('finishing call');
      state.callActive  = false;
      state.log         = [];
      state.currentTeam = {
        uuid : 'none',
        color: 'pink',
        data : {
          name: 'noni'
        }
      };
    },
    /**
     * Logs an error in a call
     * @param state
     * @param options
     */
    logFail({state}, options) {
      let info = {ts: DateTime.now().toISOTime(), message: options.msg, title: options.title, _rowVariant: 'danger'};
      console.log('error message', info);
      state.log.push(info);
    },
    /**
     * Logs an info
     * @param state
     * @param options
     */
    logInfo({state}, options) {
      let info = {ts: DateTime.now().toISOTime(), message: options.msg, title: options.title};
      console.log('info message', info);
      state.log.push(info);
    },
    /**
     * Logs a success
     * @param state
     * @param options
     */
    logSuccess({state}, options) {
      let info = {ts: DateTime.now().toISOTime(), message: options.msg, title: options.title, _rowVariant: 'success'};
      console.log('success message', info);
      state.log.push(info);
    },


  }

};

export default module;
