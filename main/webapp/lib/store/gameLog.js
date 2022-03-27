/**
 * The Game Logs
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 27.03.22
 **/


import {createHelpers} from 'vuex-map-fields';
import {find} from 'lodash';
import {DateTime} from 'luxon';

const {getGameLogField, updateGameLogField} = createHelpers({
  getterType  : 'getGameLogField',
  mutationType: 'updateGameLogField'
});

const GameLog = {
  namespaced: true,
  state     : () => ({
    entries: []
  }),
  getters   : {
    getGameLogField,
  },
  mutations : {
    updateGameLogField
  },
  actions   : {
    /**
     * Pushes a log entry into the list
     * @param state
     * @param params
     */
    pushEntry({state}, params) {
      let logEntry = params.logEntry;
      if (find(state.entries, entry => {
        return (entry.id.localeCompare(logEntry.id) === 0);
      })) {
        return;
      }
      logEntry.timestamp = DateTime.fromISO(logEntry.timestamp);
      console.log('New log received B', logEntry);
      state.entries.push(logEntry);
    }
  }
}

export default GameLog;
