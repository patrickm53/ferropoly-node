/**
 * Web app for the main page, where games are selected, Game edition
 *
 * Created by KC, 17.10.2021
 */
import Vue from 'vue';
import {BootstrapVue} from 'bootstrap-vue';
import $ from 'jquery';
import VueRouter from 'vue-router';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import {DateTime} from 'luxon';

// Import components
import ModalAgb from '../common/components/modal-agb/modal-agb.vue';
import GameSelector from './components/game-selector.vue';

Vue.use(VueRouter);

Vue.component('game-selector', GameSelector);

// This is for redirection when declining the AGB
const routes = [
  {
    path     : '/login',
    component: ModalAgb,
    name     : 'home',
    beforeEnter() {
      location.href = '/login';
    }
  },
];
const router = new VueRouter({
  routes // short for `routes: routes`
});

console.log('Webapp initializing');

// Ferropoly Style!
import '../common/style/app.scss';
// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);

Vue.filter('formatDate', function (value) {
  return DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
});

/**
 * Startpoint of the game-selector view
 */
$(document).ready(function () {
  console.log('DOM ready');
  new Vue({
    el     : '#game-selector-app',
    router,
    created: function () {
      console.log('created');
    },
    data   : {
      user   : {
        name: ''
      },
      images : {
        background: ''
      },
      methods: {}

    }
  });
});
