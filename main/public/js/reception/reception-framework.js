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
  for (var i = 0; i < receptionPanels.length; i++) {
    $(receptionPanels[i]).hide();
  }
  // There are some things to be done when activating a panel
  switch(p) {
    case '#panel-teamaccounts':
      ferropolySocket.emit('teamAccount', {cmd: {name:'getAccountStatement'}});
      break
  }
  $(p).show();
}

$(document).ready(function () {
  showPanel('#panel-main');
});



var ferropolyApp = angular.module('ferropolyApp', []);
