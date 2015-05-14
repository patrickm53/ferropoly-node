/**
 * JQuery stuff for the complete reception
 * Created by kc on 14.05.15.
 */
'use strict';


/**
 * Show the correct panel using JQuery
 * @param p
 */
function showPanel(p) {
  $('#panel-main').hide();
  $('#panel-teamaccounts').hide();
  $(p).show();
}

$(document).ready(function () {
  showPanel('#panel-main');
});
