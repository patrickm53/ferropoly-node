/**
 * Web app for the summary
 * 05.03.2022 KC
 */
import Vue from 'vue';
import {BootstrapVue} from 'bootstrap-vue';
import $ from 'jquery';
import VueRouter from 'vue-router';
import store from './store';

// Font Awesome Part
// See: https://github.com/FortAwesome/vue-fontawesome
// Icons:
import {library} from '@fortawesome/fontawesome-svg-core';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

library.add(faExclamationCircle); // not used yet
Vue.component('FontAwesomeIcon', FontAwesomeIcon);


// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// Import components
import SummaryRoot from './components/summary-root.vue';

Vue.use(VueRouter);

Vue.component('SummaryRoot', SummaryRoot);

console.log('Webapp initializing');

// Ferropoly Style!
import '../common/style/app.scss';
import {get, last, split} from 'lodash';
import axios from 'axios';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);


/**
 * Startpoint of the app
 */
$(document).ready(function () {
  console.log('DOM ready');
  new Vue({
    el     : '#summary-app',
    created: function () {
      console.log('created');
      // Retrieve GameId for this page
      const elements = split(window.location.pathname, '/');
      let gameId     = last(elements);
      axios.get(`/summary/${gameId}/static`)
        .then(resp => {
          this.$store.dispatch({type: 'fetchPictures', gameId});
          this.$store.dispatch({type: 'fetchStaticData', data: resp.data});
          this.$store.dispatch({type: 'saveRankingList', ranking: resp.data.ranking});
          this.$store.dispatch({type: 'saveTeamAccountEntries', accountData: resp.data.accountStatement.accountData});
          this.$store.dispatch({type: 'travelLog/saveTravelLogEntries', travelLog: resp.data.travelLog});
          this.$store.dispatch({type: 'chancellery/saveChancelleryData', chancellery: resp.data.chancellery});
        })
        .catch(err => {
          let errorMessage = get(err, 'response.data.message', null) || err.message;
          console.error(`Error in summary app: ${errorMessage}`, err);
        })
    },
    store  : store
  });
});
