/**
 * This is the main file of the checkin
 * Created by kc on 09.01.16.
 */

'use strict';
var viewUpdateHandlers = {}; // Handlers being called when a view gets activated
var views = ['#view-dashboard', '#view-map', '#view-teamaccount', '#view-properties', '#view-pricelist'];

/**
 * Registers an update handler
 * @param panel
 * @param handler
 */
function registerViewUpdateHandler(panel, handler) {
  viewUpdateHandlers[panel] = handler;
}


/**
 * Activate a view
 * @param v
 */
function activateView(v) {
  console.log('activate ' + v);
  for (var i = 0; i < views.length; i++) {
    $(views[i]).hide();
  }

  if (viewUpdateHandlers[v]) {
    viewUpdateHandlers[v]();
  }
  $(v).show();
}

/**
 * Function called when document is ready
 */
$(document).ready(function () {
  console.log('document ready');
  //activateView('#view-pricelist');
  activateView('#view-dashboard');
});


/**
 * The ferropoly app object for the angular controllers
 * @type {*|module}
 */
var checkinApp = angular.module('checkinApp', []);
