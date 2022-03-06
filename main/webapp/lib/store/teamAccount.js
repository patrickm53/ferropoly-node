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
     * Updates the team account entries
     * @param state
     * @param commit
     * @param options has to contain a gameId
     * @returns promise
     */
    loadTeamAccountEntries({state, commit}, options) {
      console.log('update team');
      let query = '?start=' + state.lastValidTimestamp;

      return new Promise((resolve, reject) => {
        axios.get(`/teamAccount/get/${options.gameId}/all${query}`)
          .then(resp => {
            forEach(resp.data.accountData, rawEntry => {
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

                if (resp.data.accountData.length < 50) {
                  console.log('team account info', entry);
                }
              }
            });
            if (resp.data.accountData.length > 0) {
              state.lastValidTimestamp = resp.data.accountData[resp.data.accountData.length - 1].timestamp;
            }

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
    }
  }

};

export default module;
