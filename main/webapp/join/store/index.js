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
import {assign, get} from 'lodash';
import {getAuthToken} from '../../common/adapter/authToken';
import axios from 'axios';
import {DateTime} from 'luxon';

Vue.use(Vuex);

const store = new Vuex.Store({
  state    : {
    gameplay: {
      owner     : {},
      scheduling: {},
      internal  : {
        gameId: 'none'
      },
      rules     : {
        text: '<em>not yet</em>'
      },
      joining   : {
        infotext     : '',
        possibleUntil: '2121-12-21T00:00:00'
      },
      gamename  : ''
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
    },
    api     : {
      error         : {
        message : null,
        infoText: null,
        active  : false
      },
      requestPending: false
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
    phoneValid       : state => {
      return checkPhone(state.teamInfo.phone);
    },
    /**
     * True, when button shall be enabled
     * @param state
     * @param getters
     * @returns {any}
     */
    joiningButtonEnabled: (state, getters) => {
      return (getters.nameValid && getters.organizationValid && getters.phoneValid && !state.api.requestPending);
    },
    /**
     * True if you still can join the game, false if it is too late
     * @param state
     */
    joiningPossible: (state) => {
      let deadline = DateTime.fromISO(state.gameplay.joining.possibleUntil);
      return DateTime.now() < deadline;
    }

  },
  mutations: {
    updateField,
    /**
     * Resets the API error from the last call, used when closing the modal dialog
     * @param state
     */
    resetApiError(state) {
      console.log('resetting api error');
      state.api.error.active   = false;
      state.api.error.infoText = '';
      state.api.error.message  = '';
    },
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
      let gameId = get(options, 'gameId', get(state, 'gameplay.internal.gameId', 'nixda'));
      $.ajax(`/join/data/${gameId}`, {dataType: 'json'})
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
    /**
     * Joins the game
     * @param state
     * @param options
     * @param dispatch
     */
    joinGame({state, dispatch}, options) {
      state.api.requestPending = true;
      getAuthToken((err, authToken) => {
        if (err) {
          console.error(err);
          state.api.error.message  = err.message;
          state.api.error.infoText = 'Es gibt einen Fehler mit der Berechtigung, bitte neu einloggen.';
          state.api.error.active   = true;
          return;
        }
        axios.post(`/join/${state.gameplay.internal.gameId}`,
          {
            authToken   : authToken,
            teamName    : state.teamInfo.name,
            organization: state.teamInfo.organization,
            phone       : state.teamInfo.phone,
            remarks     : state.teamInfo.remarks
          })
          .then(function () {
            console.log('saved, ok, loading data again');
            dispatch('fetchData');
          })
          .catch(function (err) {
            console.error(err);
            state.api.error.message  = get(err, 'response.data.message', err);
            state.api.error.infoText = 'Es gab ein Problem mit der Anmeldung.';
            state.api.error.active   = true;
          })
          .finally(function () {
            state.api.requestPending = false;
          });
      });
    }
  }
});

export default store;

