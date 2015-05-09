/**
 *
 * Created by kc on 09.05.15.
 */
'use strict';

function showPanel(p) {
  $('#ps').hide();
  $('#p0').hide();
  $('#p1').hide();
  $('#p2').hide();
  $('#p3').hide();
  $(p).show()
}

var infoControl = angular.module('infoApp', []);
infoControl.controller('infoCtrl', ['$scope', '$http', function ($scope, $http) {
  var map;
  var mapCenter;

  /**
   * Initializes all markers of the properties array
   * @param map  Google Map to use
   * @param properties Array with the properties
   */
  var initPropertyMarkers = function () {
    var latSum = 0;
    var lngSum = 0;

    for (var i = 0; i < pl.length; i++) {
      console.log(pl[i].location);
      var newMarker = new google.maps.Marker({
        position: new google.maps.LatLng(pl[i].location.position.lat, pl[i].location.position.lng),
        map: map,
        draggable: false
      });

      latSum += parseFloat(pl[i].location.position.lat);
      lngSum += parseFloat(pl[i].location.position.lng);

      newMarker.property = pl[i];

      // This is a special procedure allowing all markers to be unique (scope problem)!
      google.maps.event.addListener(newMarker, 'click', (function (newMarker) {
        return function () {
          var pos = newMarker.property.pricelist.position + 1;
          var desc = '<h3>' + newMarker.property.location.name + '</h3>';
          desc += 'Position in Preisliste: ' + pos + '<br/>';
          desc += 'Preis: ' + newMarker.property.pricelist.price + '<br/>';
          desc += 'Maximale Miete: ' + newMarker.property.pricelist.rents.hotel + '<br/>';
          new google.maps.InfoWindow({
            content: desc,
            maxWidth: 200
          }).open(map, newMarker);
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
    if (err.length > 0 || err2.length > 0) {
      showPanel('#p0');
      console.log('ERROR!');
    }
    else {
      showPanel('#p3');
    }
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

    initPropertyMarkers();
    $scope.$apply();
  });
}]);
