/**
 *
 * Created by kc on 09.05.15.
 */
'use strict';
var map;
var mapCenter;

/**
 * Show the correct panel using JQuery
 * @param p
 */
function showPanel(p) {
  $('#ps').hide();
  $('#p0').hide();
  $('#p1').hide();
  $('#p2').hide();
  $('#p3').hide();
  $(p).show();


  _.delay(function () {

    // Force the update
    google.maps.event.trigger(map, 'resize');
    map.setCenter(mapCenter);
  }, 250);

}

var infoControl = angular.module('infoApp', []);
infoControl.controller('infoCtrl', ['$scope', '$http', function ($scope, $http) {
  var ICON_EDIT_LOCATION = 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png';
  var ICON_TRAIN_LOCATION = 'https://maps.gstatic.com/mapfiles/ms2/micons/green.png';
  var ICON_BUS_LOCATION = 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow.png';
  var ICON_BOAT_LOCATION = 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png';
  var ICON_CABLECAR_LOCATION = 'https://maps.gstatic.com/mapfiles/ms2/micons/purple.png';
  var ICON_OTHER_LOCATION = 'https://maps.gstatic.com/mapfiles/ms2/micons/pink.png';

  var currentProperty;
  var lngMax = 0;
  var lngMin = 180;
  var latMax = 0;
  var latMin = 180;

  /**
   * Set the icon for this location in the map
   */
  var setMarkerIcon = function (property) {

    switch (property.location.accessibility) {
      case 'train':
        property.marker.setIcon(ICON_TRAIN_LOCATION);
        break;

      case 'bus':
        property.marker.setIcon(ICON_BUS_LOCATION);
        break;

      case 'boat':
        property.marker.setIcon(ICON_BOAT_LOCATION);
        break;

      case 'cablecar':
        property.marker.setIcon(ICON_CABLECAR_LOCATION);
        break;

      default:
        property.marker.setIcon(ICON_OTHER_LOCATION);
        break;
    }
  };

  /**
   * set the current property
   * @param property
   */
  var setCurrentProperty = function (property) {
    if (currentProperty) {
      setMarkerIcon(currentProperty);
    }
    property.marker.setIcon(ICON_EDIT_LOCATION);
    currentProperty = property;
  };
  /**
   * Show the info for a location
   * @param marker
   */
  var showInfoWindow = function (marker) {
    var pos = marker.property.pricelist.position + 1;
    var desc = '<h3>' + marker.property.location.name + '</h3>';
    desc += 'Position in Preisliste: ' + pos + '<br/>';
    desc += 'Preis: ' + marker.property.pricelist.price + '<br/>';
    desc += 'Maximale Miete: ' + marker.property.pricelist.rents.hotel + '<br/>';
    desc += 'Erreichbarkeit: ' + marker.property.location.accessibility + '<br/>';
    new google.maps.InfoWindow({
      content: desc,
      maxWidth: 200
    }).open(map, marker);
  };

  /**
   * Initializes all markers of the properties array
   * @param map  Google Map to use
   * @param properties Array with the properties
   */
  var initPropertyMarkers = function () {
    var latSum = 0;
    var lngSum = 0;

    for (var i = 0; i < pl.length; i++) {
      var newMarker = new google.maps.Marker({
        position: new google.maps.LatLng(pl[i].location.position.lat, pl[i].location.position.lng),
        map: map,
        draggable: false
      });

      var lat = pl[i].location.position.lat;
      var lng = pl[i].location.position.lng;
      latSum += parseFloat(lat);
      lngSum += parseFloat(lng);
      if (lat > latMax) latMax = lat;
      if (lat < latMin) latMin = lat;
      if (lng > lngMax) lngMax = lng;
      if (lng < lngMin) lngMin = lng;


      newMarker.property = pl[i];
      pl[i].marker = newMarker;

      setMarkerIcon(newMarker.property);
      // This is a special procedure allowing all markers to be unique (scope problem)!
      google.maps.event.addListener(newMarker, 'click', (function (newMarker) {
        return function () {
          showInfoWindow(newMarker);
        }
      })(newMarker));
    }
    //setCurrentProperty($scope.markers[0]);
    // $scope.setVisibleMarkers();
    mapCenter = new google.maps.LatLng(latSum / i, lngSum / i);
    map.setCenter(mapCenter);
  };

  /**
   * Document ready
   */
  $(document).ready(function () {
    showPanel('#p1');

    $scope.gp = gp;
    $scope.pl = pl;
    $scope.teams = teams;

    var mapOptions = {
      center: new google.maps.LatLng(47.29725, 8.867215),
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
      mapOptions);

    google.maps.event.addListener(map, 'zoom_changed', function (e) {
      if (map.getZoom() < 7) {
        map.setZoom(7);
      }
      if (map.getZoom() > 14) {
        map.setZoom(14);
      }
    });
    google.maps.event.addListener(map, 'ds', function (e) {
      console.log(e);
      var center = map.getCenter();
      var latNew = center.lat();
      var lngNew = center.lng();
      var changed = false;

      if (center.lat() > latMax) {
        latNew = latMax;
        changed = true;
      }
      if (center.lat() < latMin) {
        latNew = latMin;
        changed = true;
      }
      if (center.lng() > lngMax) {
        lngNew = lngMax;
        changed = true;
      }
      if (center.lng() < lngMin) {
        lngNew = lngMin;
        changed = true;
      }

      if (changed) {
        console.log(latNew + ' + ' + lngNew);
        map.setCenter(new google.maps.LatLng(latNew, lngNew));
      }
    });
    initPropertyMarkers();
    $scope.$apply();
  });
  /**
   * Show marker
   * @param m
   */
  $scope.showMarker = function (m) {
    map.setCenter(m.getPosition());
    setCurrentProperty(m.property);
  }
}])
;
