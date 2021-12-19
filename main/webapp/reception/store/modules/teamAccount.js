/**
 * Team Account module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import {get, last, findLast, forEach} from 'lodash';
import axios from 'axios';

const {getTeamAccountField, updateTeamAccountField} = createHelpers({
  getterType  : 'getTeamAccountField',
  mutationType: 'updateTeamAccountField'
});

const module = {
  state    : () => ({
    accounts          : {
      team01: [], // Arrays with the internal names of the teams => track changes
      team02: [],
      team03: [],
      team04: [],
      team05: [],
      team06: [],
      team07: [],
      team08: [],
      team09: [],
      team10: [],
      team11: [],
      team12: [],
      team13: [],
      team14: [],
      team15: [],
      team16: [],
      team17: [],
      team18: [],
      team19: [],
      team20: [],
    },
    id2accounts       : {}, // object with teamId as property, containing the account names
    lastValidTimestamp: '2020-07-06T12:00'
  }),
  getters  : {
    getTeamAccountField,
    teamAccountData: (state) => (id) => {
      return state.accounts[state.id2accounts[id]];
    }
  },
  mutations: {
    updateTeamAccountField
  },
  actions  : {
    /**
     * Updates the team account entries
     * @param state
     * @param commit
     * @param rootState
     * @param options
     */
    updateTeamAccountEntries({state, commit, rootState}, options) {
      console.log('update team');
      let query = '?start=' + state.lastValidTimestamp;

      axios.get(`/teamAccount/get/${rootState.gameId}/all${query}`)
        .then(resp => {
          console.log('teamAccount', resp.data);

          forEach(resp.data.accountData, entry => {
            let account = state.accounts[state.id2accounts[entry.teamId]];

            if (!findLast(account, {_id: entry._id})) {
              let teamBalanceEntry = last(account);
              let teamBalance      = 0;
              if (teamBalanceEntry) {
                teamBalance = teamBalanceEntry.balance;
              }
              entry.balance = teamBalance + entry.transaction.amount;
              if (entry.transaction.origin.category === 'team') {
                entry.transaction.origin.teamName = this.getters.teamIdToTeamName(entry.transaction.origin.uuid);
              }
              account.push(entry)

              if (resp.data.accountData.length < 50) {
                console.log('team account info', entry);
              }
            }
          });
          if (resp.data.accountData.length > 0) {
            state.lastValidTimestamp = resp.data.accountData[resp.data.accountData.length - 1].timestamp;
          }

          console.log('finished', state.lastValidTimestamp, state.accounts);
        })
        .catch(err => {
          console.error(err);
          rootState.api.error.message  = get(err, 'response.data.message', null) || err.message
          rootState.api.error.infoText = 'Es gab einen Fehler beim Laden der Kontobücher:';
          rootState.api.error.active   = true;
        })

    }
  }

};

export default module;
