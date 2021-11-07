/**
 * Join a game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 6.11.2021
 **/


import Vue from 'vue';
import Vuex from 'vuex';
import {BootstrapVue} from 'bootstrap-vue';
import $ from 'jquery';
import VueRouter from 'vue-router';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// Import components
import JoinRoot from './components/join-root.vue';
import store from './store';

Vue.use(VueRouter);
Vue.use(Vuex);

Vue.component('join-root', JoinRoot);

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
    el     : '#join-app',
    created: function () {
      console.log('created');
    },
    store  : store,
    data   : {}
  });
});

