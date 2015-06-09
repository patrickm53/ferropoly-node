/**
 *
 * Created by kc on 09.06.15.
 */
'use strict';
var map;
/**
 * Load map when ready
 */
$(document).ready(function () {
  if (google.maps) {
    var mapOptions = {
      center: new google.maps.LatLng(47.29725, 8.867215),
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
      mapOptions);
  }
});

/**
 * Refresh map panel when activating it
 */
function refreshMapPanel() {
  if (!google.maps) {
    return;
  }
  _.delay(function () {
    // Force the update
    google.maps.event.trigger(map, 'resize');
    map.setCenter(mapCenter);
  }, 250);
}

/**
 * The angular controller for the maps
 */
ferropolyApp.controller('mapCtrl', mapCtrl);
function mapCtrl($scope, $http) {

  $scope.mapApiLoaded = function () {
    return (google && google.maps);
  };
}


mapCtrl.$inject = ['$scope', '$http'];
