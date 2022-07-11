/**
 * The Game Logs
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 27.03.22
 **/


import {createHelpers} from 'vuex-map-fields';
import {find} from 'lodash';
import {DateTime} from 'luxon';
import {formatTimestampAsAgo} from '../../common/lib/formatters';

const {getGameLogField, updateGameLogField} = createHelpers({
  getterType  : 'getGameLogField',
  mutationType: 'updateGameLogField'
});

const GameLog = {
  namespaced: true,
  state     : () => ({
    entries  : []
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
        // Entry already in list, do not add
        return;
      }
      logEntry.timestamp = DateTime.fromISO(logEntry.timestamp);
      logEntry.timeInfo  = formatTimestampAsAgo(logEntry.timestamp);
      state.entries.push(logEntry);
    },
    /**
     * Updates the time info ("5 seconds ago")
     * @param state
     */
    updateTimeinfo({state}) {
      state.entries.forEach(e => {
        e.timeInfo = formatTimestampAsAgo(e.timestamp);
      });
    }
  }
}

export default GameLog;
