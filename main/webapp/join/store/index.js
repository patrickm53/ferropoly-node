/**
 * Join Store
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.11.21
 **/


import Vue from 'vue';
import Vuex from 'vuex';
import {getField, updateField} from 'vuex-map-fields';
import $ from 'jquery';
import {checkNames, checkPhone} from '../../common/lib/playerValidator';
import {assign} from 'lodash';


Vue.use(Vuex);

const store = new Vuex.Store({
  state    : {
    gameplay: {
      owner     : {},
      scheduling: {},
      internal  : {},
      rules     : {
        text: '<em>not yet</em>'
      },
      joining   : {
        infotext: ''
      }
    },
    user    : {
      personalData: {},
      id          : '',
      name        : ''
    },
    teamInfo: {
      name            : '',
      organization    : '',
      phone           : '',
      remarks         : '',
      confirmed       : false,
      id              : null,
      registrationDate: null,
      changedDate     : null
    }

  },
  getters  : {
    getField,
    nameValid        : state => {
      return checkNames(state.teamInfo.name);
    },
    organizationValid: state => {
      return checkNames(state.teamInfo.organization);
    },
    phoneValid: state => {
      return checkPhone(state.teamInfo.phone);
    }

  },
  mutations: {
    updateField,
    testy(state, payload) {
      console.log('commit', payload);
      state.teamInfo.name = payload.text;
      console.log(state.teamInfo);
    }
  },
  actions  : {
    /**
     * Get all infos needed
     * @param state
     * @param commit
     * @param rootState
     * @param options
     */
    fetchData({state, commit, rootState}, options) {
      $.ajax(`/join/data/${options.gameId}`, {dataType: 'json'})
        .done(function (data) {
          console.log(data);
          // assign is important, otherwise no 2-way-binding in vue possible!
          assign(state.gameplay, data.gameplay);
          assign(state.user, data.user);
          assign(state.teamInfo, data.teamInfo);

          // some specialities
          state.user.name = `${data.user.personalData.forename} ${data.user.personalData.surname}`;
        })
        .fail(function (err) {
          console.error(err);
        });
    },

  }
});

export default store;

