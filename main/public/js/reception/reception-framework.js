/**
 * JQuery stuff for the complete reception
 * Created by kc on 14.05.15.
 */
'use strict';
var panelUpdateHandlers = {}; // Handlers being called when a panel gets activated

/**
 * Registers an update handler
 * @param panel
 * @param handler
 */
function registerPanelUpdateHandler(panel, handler) {
  panelUpdateHandlers[panel] = handler;
}
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
  // There are some things to be done when activating a panel (THE OLD WAY)
  switch (p) {
    case '#panel-teamaccounts':
      dataStore.updateTeamAccountEntries(undefined, angular.element('#team-accounts-ctrl').scope().refreshTeamAccounts);
      break;

    case '#panel-managecall':
      activeCallAlert.hide();
      break;

    case '#panel-stats':
      angular.element('#ferrostats-ctrl').scope().refresh();
      break;

    case '#panel-map':
      refreshMapPanel();
      break;
  }

  // Update panel info (THE NEW WAY)
  if (panelUpdateHandlers[p]) {
    panelUpdateHandlers[p]();
  }
  $(p).show();
}

/**
 * Function called when document is ready
 */
$(document).ready(function () {
  console.log('document ready');
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
ferropolyApp.filter('offset', function () {
  return function (input, start) {
    start = parseInt(start, 10);
    return input.slice(start);
  };
});

/**
 * This is the amount filter returning nicer values
 */
ferropolyApp.filter('amount', function () {
  return function (val) {
    if (_.isNumber(val)) {
      return val.toLocaleString('de-CH');
    }
    return val;
  }
});
