/**
 * Web app for login
 */
import Vue from 'vue';
import {BootstrapVue} from 'bootstrap-vue';
import $ from 'jquery';
import VueRouter from 'vue-router';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// Import components
import Login from '../common/components/login/login.vue';

Vue.use(VueRouter);

Vue.component('login', Login);


console.log('Webapp initializing');

// Ferropoly Style!
import '../common/style/app.scss';
// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);


/**
 * Startpoint of the meteo view
 */
$(document).ready(function () {
  console.log('DOM ready');
  new Vue({
    el     : '#login-app',
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
