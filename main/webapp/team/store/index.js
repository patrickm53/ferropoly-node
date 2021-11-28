/**
 * Store for new Teams
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 28.11.21
 **/
import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';
import {set} from 'lodash';
import {addTeamMember, getTeamMembers} from '../adapter/teamMembers';

Vue.use(Vuex);

const store = new Vuex.Store({
  state    : {
    newMember: '',
    members  : [],
    gameId   : 'none',
    teamId   : 'none'
  },
  getters  : {getField},
  mutations: {updateField},
  actions  : {
    fetchTeamMembers({state}) {
      getTeamMembers(state.gameId, state.teamId, (err, members) => {
        if (err) {
          console.error(err);
          return;
        }
        set(state, 'members', members);
        console.log('members read', members);
      });
    },
    addTeamMember({state, dispatch}) {
      addTeamMember(state.gameId, state.teamId, state.newMember, err => {
        if (err) {
          console.error(err);
          return;
        }
        state.newMember = '';
        dispatch('fetchTeamMembers');
      });
    }
  }

});

export default store;
