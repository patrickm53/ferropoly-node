/**
 * The map for the check-in
 * Created by kc on 23.01.16.
 */

'use strict';


/**
 * Load Google Maps API, this is only done when needed
 * @returns {*}
 */
function loadGoogleMapsApi() {
  var options = {
    dataType: "script",
    cache   : true,
    url     : 'https://maps.googleapis.com/maps/api/js?key=AIzaSyClFIdi03YvYPvLikNwLSZ748yw1tfDVXU&signed_in=true'
  };
  return jQuery.ajax(options);
}

/**
 * Initialize the map: loads the google api and draws the map the first time
 */
function initializeMap() {
  // Load the map only once
  if (typeof google === 'undefined' || google === null) {
    loadGoogleMapsApi()
      .done(function (script, textStatus) {
        console.warn(textStatus);
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 8
        });
      })
      .fail(function (jqxhr, settings, exception) {
        console.error(jqxhr, settings, exception);
      });
  }
}

// Register the handler when the view gets activated
registerViewUpdateHandler('#view-map', function() {
  initializeMap();
});

/**
 * The Checkin Map controller
 * @param $scope
 * @param $http
 */
function checkinMapController($scope, $http) {

}

checkinApp.controller('checkinMapController', checkinMapController);
dashboardCtrl.$inject = ['$scope', '$http'];

