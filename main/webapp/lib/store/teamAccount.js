/**
 * Team Account module for the store
 *
 * Thes module REQUIRES THE TEAM MODULE being present
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import {get, last, findLast, forEach} from 'lodash';
import axios from 'axios';
import {TeamAccountTransaction} from '../teamAccountTransaction';

const {getTeamAccountField, updateTeamAccountField} = createHelpers({
  getterType  : 'getTeamAccountField',
  mutationType: 'updateTeamAccountField'
});

/**
 * Handles the received team account entries and updates the balance
 * @param accountData is an array with the account data
 * @param state
 */
function handleTeamAccountEntries(accountData, state) {
  forEach(accountData, rawEntry => {
    let entry   = new TeamAccountTransaction(rawEntry);
    let account = state.accounts[state.id2accounts[entry.teamId]];

    if (!findLast(account, {_id: entry._id})) {
      let teamBalanceEntry = last(account);
      let teamBalance      = 0;
      if (teamBalanceEntry) {
        teamBalance = teamBalanceEntry.balance;
      }
      entry.balance = teamBalance + entry.transaction.amount;
      if (entry.transaction.origin.category === 'team') {
        entry.transaction.origin.teamName = this.getters['teams/idToTeamName'](entry.transaction.origin.uuid);
      }
      account.push(entry)
    }
  });
  if (accountData.length > 0) {
    state.lastValidTimestamp = accountData[accountData.length - 1].timestamp;
  }
}


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
    /**
     * Return the complete data of a specific team
     * @param state
     * @returns {function(*): *}
     */
    teamAccountData: (state) => (id) => {
      return state.accounts[state.id2accounts[id]];
    },
    /**
     * Returns the team account balance
     * @param state
     * @returns {function(*): any}
     */
    teamAccountBalance: (state) => (id) => {
      let lastEntry = last(state.accounts[state.id2accounts[id]]) || {};
      return get(lastEntry, 'balance', 0);
    }
  },
  mutations: {
    updateTeamAccountField
  },
  actions  : {
    /**
     * Initializes the team accounts
     * @param state
     * @param teams are Team Objects
     */
    initTeamAccounts({state}, teams) {
      teams.forEach(t => {
        state.id2accounts[t.uuid] = t.internalName;
      })
    },
    /**
     * Adds a single team account transaction
     * @param state
     * @param options
     */
    addTeamAccountTransaction({state}, options) {
      let teamId = get(options, 'transaction.teamId', null);
      if (!teamId) {
        console.warn('Invalid transaction received', options);
        return;
      }
      console.time('addTeamAccountTransaction');
      let entry   = new TeamAccountTransaction(options.transaction);
      let account = state.accounts[state.id2accounts[entry.teamId]];
      if (!findLast(account, {_id: entry._id})) {
        if (entry.transaction.origin.category === 'team') {
          entry.transaction.origin.teamName = this.getters['teams/idToTeamName'](entry.transaction.origin.uuid);
        }
        account.push(entry)
      }
      // Rebuild data
      let balance = 0;
      account.forEach(e => {
        balance += e.transaction.amount;
        e.balance = balance;
      })
      console.timeEnd('addTeamAccountTransaction');
    },
    /**
     * Updates the team account entries
     * @param state
     * @param commit
     * @param options has to contain a gameId
     * @returns promise
     */
    loadTeamAccountEntries({state, commit}, options) {
      console.log('update team account entries', options);
      let query = '?start=' + state.lastValidTimestamp;
      let teamId = get(options, 'teamId', 'all');

      return new Promise((resolve, reject) => {
        axios.get(`/teamAccount/get/${options.gameId}/${teamId}${query}`)
          .then(resp => {
            let accountData = resp.data.accountData;
            handleTeamAccountEntries.call(this, accountData, state);

            console.log('finished', state.lastValidTimestamp, state.accounts);
            return resolve(state.accounts);
          })
          .catch(err => {
            console.error(err);
            return reject({
              message : get(err, 'response.data.message', null) || err.message,
              infoText: 'Es gab einen Fehler beim Laden der Kontobücher:',
              active  : true
            })
          })
      });
    },
    /**
     * Saves thge team account entries "received by another path" (not getting them in the module -> summary app)
     * @param state
     * @param options
     */
    saveTeamAccountEntries({state}, options) {
      let accountData = options.accountData;
      handleTeamAccountEntries.call(this, accountData, state);
    }

  }

};

export default module;
