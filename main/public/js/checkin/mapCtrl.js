/**
 * The map for the check-in
 * Created by kc on 23.01.16.
 */

'use strict';


/**
 * The Checkin Map controller
 * @param $scope
 * @param $http
 */
function checkinMapController($scope, $http) {
  var map;
  var positionMarker;

  $scope.position = {coords: {latitude: 47.352275, longitude: 7.9066919}};

  // Geolocation
  geograph.onLocationChanged(function (pos) {
    $scope.position = pos;
    if (map) {
      map.setCenter({lat: pos.coords.latitude, lng: pos.coords.longitude});
      positionMarker.setPosition({lat: pos.coords.latitude, lng: pos.coords.longitude});

    }
    $scope.$apply();
  });

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
          map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: $scope.position.coords.latitude, lng: $scope.position.coords.longitude},
            zoom  : 10
          });

          positionMarker = new google.maps.Marker({
            position: {lat: $scope.position.coords.latitude, lng: $scope.position.coords.longitude},
            map: map,
            title: 'Hello World!'
          });
        })
        .fail(function (jqxhr, settings, exception) {
          console.error(jqxhr, settings, exception);
        });
    }
  }

  // Register the handler when the view gets activated
  registerViewUpdateHandler('#view-map', function () {
    initializeMap();
  });


}

checkinApp.controller('checkinMapCtrl', checkinMapController);
checkinMapController.$inject = ['$scope', '$http'];

