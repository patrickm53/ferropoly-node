/**
 * This is the main file of the checkin
 * Created by kc on 09.01.16.
 */

'use strict';

var views = ['#view-dashboard', '#view-map', '#view-teamaccount'];

/**
 * Activate a view
 * @param v
 */
function activateView(v) {
  console.log('activate ' + v);
  for (var i = 0; i < views.length; i++) {
    $(views[i]).hide();
  }

  $(v).show();
}

/**
 * Function called when document is ready
 */
$(document).ready(function () {
  console.log('document ready');
  activateView('#view-dashboard');
});
