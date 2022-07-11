/**
 * Web app for the "about" page
 * 10.4.2022 KC
 */
import Vue from 'vue';
import {BootstrapVue} from 'bootstrap-vue';
import $ from 'jquery';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// Import components
import AboutRoot from '../common/components/about/about-root.vue';


Vue.component('AboutRoot', AboutRoot);

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
    el     : '#about-app',
    created: function () {
      console.log('created');
    }
  });
});
