/**
 * Web app for the the team members
 * 27.11.2021 KC
 */
import Vue from 'vue';
import {BootstrapVue} from 'bootstrap-vue';
import $ from 'jquery';
import VueRouter from 'vue-router';
import store from './store';

// Font Awesome Part
// See: https://github.com/FortAwesome/vue-fontawesome
// Icons:
import { library } from '@fortawesome/fontawesome-svg-core';
import { faExclamationCircle, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faExclamationCircle);
library.add(faTrashAlt);
Vue.component('font-awesome-icon', FontAwesomeIcon);


// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// Import components
import TeamRoot from './components/team-root.vue';

Vue.use(VueRouter);

Vue.component('team-root', TeamRoot);

console.log('Webapp initializing');

// Ferropoly Style!
import '../common/style/app.scss';
// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);


/**
 * Startpoint of the app
 */
$(document).ready(function () {
  console.log('DOM ready');
  new Vue({
    el     : '#team-app',
    created: function () {
      console.log('created');
    },
    store: store,
    data   : {

    }
  });
});
