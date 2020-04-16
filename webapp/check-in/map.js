/**
 * The map for the check-in
 * Created by kc on 23.01.16.
 */

import jQuery from 'jquery'
import geograph from './geograph'
import {viewHandler} from './viewHandler'

/**
 * The Checkin Map controller
 * @param $scope
 * @param $http
 */
function checkinMapController($scope, $http) {
  const icons = {
    train       : 'https://maps.gstatic.com/mapfiles/ms2/micons/green.png',
    bus         : 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow.png',
    boat        : 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png',
    cablecar    : 'https://maps.gstatic.com/mapfiles/ms2/micons/purple.png',
    teamProperty: '/images/markers/team_property.png',
    other       : 'https://maps.gstatic.com/mapfiles/ms2/micons/pink.png'
  };


  let map;
  let positionCircle;
  let positionMarker;

  $scope.pricelist = ferropoly.pricelist;
  $scope.markers   = [];
  $scope.position = {coords: {latitude: 47.352275, longitude: 7.9066919}};

  // Geolocation
  geograph.onLocationChanged(function (pos) {
    $scope.position = pos;
    if (map) {
      var latLng = {lat: pos.coords.latitude, lng: pos.coords.longitude};
      map.setCenter(latLng);
      positionCircle.setCenter(latLng);
      positionCircle.setRadius(pos.coords.accuracy);
      positionMarker.setPosition(latLng);
    }
    $scope.$apply();
  });

  /**
   * Load Google Maps API, this is only done when needed
   * @returns {*}
   */
  function loadGoogleMapsApi() {
    let options = {
      dataType: "script",
      cache   : true,
      url     : 'https://maps.googleapis.com/maps/api/js?key=AIzaSyClFIdi03YvYPvLikNwLSZ748yw1tfDVXU&signed_in=true' /*&signed_in=true'*/
      // ToDo: url     : `https://maps.googleapis.com/maps/api/js?key=${process.env.FERROPOLY_GOOGLE_MAPS_API_KEY}&signed_in=true`  /*&signed_in=true'*/
    };
    return jQuery.ajax(options);
  }

  /**
   *
   */
  function drawPricelistMarkers() {
    $scope.markers.forEach(function (m) {
      m.setMap(null);
    });
    $scope.markers = [];

    $scope.pricelist.forEach(function (p) {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(p.location.position.lat, p.location.position.lng),
        map     : map
      });

      // Set icon
      if (p.gamedata && p.gamedata.owner) {
        marker.setIcon(icons.teamProperty);
      } else if (icons[p.location.accessibility]) {
        marker.setIcon(icons[p.location.accessibility]);
      } else {
        marker.setIcon(icons.other);
      }

      let info = `<h3>${p.location.name}</h3><p>Kaufpreis: ${p.pricelist.price}</p><p>Position in Preisliste: ${p.pricelist.position}</p>`;

      if (p.gamedata && p.gamedata.owner) {
        info += `<p>Das Grundstück gehört Euch und hat ${p.gamedata.buildings} Häuser</p>`;
      }
      let infowindow = new google.maps.InfoWindow({
          content: info
        }
      );
      marker.addListener('click', function () {
        infowindow.open(map, marker);
      });
      $scope.markers.push(marker);
    });
  }

  /**
   * Initialize the map: loads the google api and draws the map the first time
   */
  function initializeMap() {
    // Load the map only once
    if (typeof google === 'undefined' || google === null) {
      loadGoogleMapsApi()
        .done(function (script, textStatus) {
          var latLng = {lat: $scope.position.coords.latitude, lng: $scope.position.coords.longitude};
          map        = new google.maps.Map(document.getElementById('map'), {
            center: latLng,
            zoom  : 10
          });

          positionMarker = new google.maps.Marker({
            position: latLng,
            map     : map
          });

          positionCircle = new google.maps.Circle({
            strokeColor  : '#0000FF',
            strokeOpacity: 0.8,
            strokeWeight : 2,
            fillColor    : '#0000FF',
            fillOpacity  : 0.35,
            map          : map,
            center       : latLng,
            radius       : 10000
          });

          drawPricelistMarkers();
        })
        .fail(function (jqxhr, settings, exception) {
          console.error(jqxhr, settings, exception);
        });
    }
  }

  // Register the handler when the view gets activated
  let vh = viewHandler;

  vh.registerUpdateHandler('#view-map', function () {
    initializeMap();
  });


}

const initMap = function (app) {
  app.controller('checkinMapCtrl', checkinMapController);
  checkinMapController.$inject = ['$scope'];
};
export {initMap}
