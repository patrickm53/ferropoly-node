/**
 * JQuery stuff for the complete reception
 * Created by kc on 14.05.15.
 */
'use strict';


/**
 * Show the correct panel using JQuery. receptionPanels is defined in the main jade file
 * @param p
 */
function showPanel(p) {
  var activeCallAlert = $('#active-call');

  for (var i = 0; i < receptionPanels.length; i++) {
    $(receptionPanels[i]).hide();
  }
  // Panel with warning about active call
  if (activeCall.isActive()) {
    activeCallAlert.show();
  }
  else {
    activeCallAlert.hide();
  }
  // There are some things to be done when activating a panel
  switch(p) {
    case '#panel-teamaccounts':
      dataStore.updateTeamAccountEntries();
      break;

    case '#panel-managecall':
      activeCallAlert.hide();
      break;

    case '#panel-stats':
      angular.element('#ferrostats-ctrl').scope().refresh();
      break;
  }
  $(p).show();
}

/**
 * Function called when document is ready
 */
$(document).ready(function () {
  showPanel('#panel-main');
});

/**
 * The ferropoly app object for the angular controllers
 * @type {*|module}
 */
var ferropolyApp = angular.module('ferropolyApp', []);

/**
 * Filter function for the pagers
 */
ferropolyApp.filter('offset', function() {
  return function(input, start) {
    start = parseInt(start, 10);
    return input.slice(start);
  };
});
