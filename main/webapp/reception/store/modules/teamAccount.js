/**
 * Team Account module for the store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.21
 **/
import {createHelpers} from 'vuex-map-fields';
import {get, last, forIn, sortBy} from 'lodash';
import axios from 'axios';

const {getTeamAccountField, updateTeamAccountField} = createHelpers({
  getterType  : 'getTeamAccountField',
  mutationType: 'updateTeamAccountField'
});

const module = {
  state    : () => ({
    list: []
  }),
  getters  : {
    getTeamAccountField,
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

      let query = '';
      console.log('update team');

      if (state.list.length > 0) {
        query = '?start=' + last(state.list).timestamp;
      }

      axios.get(`/teamAccount/get/${rootState.gameId}/all${query}`)
        .then(resp => {
          console.log('teamAccount', resp.data);
          let data = resp.data;
          console.log('/teamAccount ok, entries: ' + data.accountData.length);
          let balance = {};
          for (let i = 0; i < state.list.length; i++) {
            let teamBalance               = balance[state.list[i].teamId] || 0;
            state.list[i].balance         = teamBalance + state.list[i].transaction.amount;
            balance[state.list[i].teamId] = state.list[i].balance;
          }
          console.log('Balances', balance);
          let newData = resp.data.accountData;
          for (let i = 0; i < newData.length; i++) {
            let teamBalance            = balance[newData[i].teamId] || 0;
            newData[i].balance         = teamBalance + newData[i].transaction.amount;
            balance[newData[i].teamId] = newData[i].balance;
            state.list.push(newData[i]);
          }
          console.log('finished', state.list.length, state.list);
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
