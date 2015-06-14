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
  dataStore.updateTravelLog();
  dataStore.updateProperties();

  _.delay(function () {
    // Force the update
    google.maps.event.trigger(map, 'resize');
    var center = dataStore.getMapCenter();
    map.setCenter(new google.maps.LatLng(center.lat, center.lng))
  }, 250);
}

/**
 * Creates a travel log marker
 * @param property
 * @param color
 * @returns {google.maps.Circle}
 */
function createTravelLogMarker(property, color, radiusFactor) {
  var markerOptions = {
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: color,
    fillOpacity: 0.35,
    map: map,
    center: new google.maps.LatLng(parseFloat(property.location.position.lat), parseFloat(property.location.position.lng)),
    radius: 4000 * radiusFactor
  };
  // Add the circle for this city to the map.
  return new google.maps.Circle(markerOptions);
}

/**
 * Draw a line
 * @param line
 * @param color
 * @returns {google.maps.Polyline}
 */
function drawTeamTravelLine(line, color) {
  var lineOptions = {
    path: line,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map
  };
  return new google.maps.Polyline(lineOptions);
}

/**
 * Creates markers for all free properties
 * @returns {Array}
 */
function createFreePropertyMarkers() {
  var freeProperties = dataStore.getFreeProperties();
  var markers = [];
  for (var i = 0; i < freeProperties.length; i++) {
    markers.push(createFreePropertyMarker(freeProperties[i]));
  }
  return markers;
}
/**
 * Creates a marker for a free property
 * @param property
 * @returns {google.maps.Circle}
 */
function createFreePropertyMarker(property) {
  var markerOptions = {
    strokeColor: 'black',
    strokeOpacity: 0.6,
    strokeWeight: 1,
    fillColor: 'white',
    fillOpacity: 0.5,
    map: map,
    center: new google.maps.LatLng(parseFloat(property.location.position.lat), parseFloat(property.location.position.lng)),
    radius: 2000
  };
  // Add the circle for this city to the map.
  return new google.maps.Circle(markerOptions);
}
/**
 * The angular controller for the maps
 */
ferropolyApp.controller('mapCtrl', mapCtrl);
function mapCtrl($scope, $http) {

  $scope.travelLogMarkers = [];
  $scope.teams = [];
  /**
   * Build the team info for the map
   */
  $scope.buildTeamInfo = function () {
    var teams = dataStore.getTeams();
    for (var i = 0; i < teams.length; i++) {
      $scope.teams.push({
        teamId: teams[i].uuid,
        name: teams[i].data.name,
        color: dataStore.getTeamColor(teams[i].uuid),
        displayOnMap: true
      });
    }
  };
  /**
   * Returns true when the api was loaded
   */
  $scope.mapApiLoaded = function () {
    return (google && google.maps);
  };

  /**
   * Get the travel log
   * @param teamId
   * @returns {*}
   */
  $scope.getTravelLog = function (teamId) {
    return dataStore.getTravelLog(teamId);
  };

  /**
   * Draw the travel log on the map
   */
  $scope.drawTravelLog = function () {
    var i;
    $scope.deleteFreePropertyMarkers();
    $scope.deleteTravelLogMarkers();
    $scope.deleteTravelLines();
    $scope.freePropertyMarkers = createFreePropertyMarkers();
    $scope.travelLines = [];

    // filter hidden ones
    for (i = 0; i < $scope.teams.length; i++) {
      if ($scope.teams[i].displayOnMap) {
        var log = _.map(dataStore.getTravelLog($scope.teams[i].teamId), _.clone);
        log = _.sortBy(log, 'timestamp');
        var factor = 1 / log.length;
        var line = [];
        for (var t = 0; t < log.length; t++) {
          var property = dataStore.getPropertyById(log[t].propertyId);
          line.push(new google.maps.LatLng(parseFloat(property.location.position.lat), parseFloat(property.location.position.lng)));
          $scope.travelLogMarkers.push({
            teamId: log[t].teamId,
            marker: createTravelLogMarker(property, dataStore.getTeamColor(log[t].teamId), factor * (t + 1))
          });

          $scope.travelLines.push(drawTeamTravelLine(line, dataStore.getTeamColor(log[t].teamId)));
        }

      }
    }
  };

  /**
   * Delete the travel log markers
   * @param teamId
   */
  $scope.deleteTravelLogMarkers = function () {
    if ($scope.travelLogMarkers) {
      for (var i = 0; i < $scope.travelLogMarkers.length; i++) {
        $scope.travelLogMarkers[i].marker.setMap(null);
      }
      $scope.travelLogMarkers = [];
    }
  };

  /**
   * Deletes the free property markers
   */
  $scope.deleteFreePropertyMarkers = function () {
    if ($scope.freePropertyMarkers) {
      for (var i = 0; i < $scope.freePropertyMarkers.length; i++) {
        $scope.freePropertyMarkers[i].setMap(null);
      }
      $scope.freePropertyMarkers = [];
    }
  };
  /**
   * Deletes the free property markers
   */
  $scope.deleteTravelLines = function () {
    if ($scope.travelLines) {
      for (var i = 0; i < $scope.travelLines.length; i++) {
        $scope.travelLines[i].setMap(null);
      }
      $scope.travelLines = [];
    }
  };

  // Panels to be shown in the tabs. Initialize at the end of the controller, as the handlers
  // have to be initialized before
  $scope.panels = [
    {
      id: 'maps-travellog'
    },
    {
      id: 'maps-pricelist'
    }];
  /**
   * Show the correct panel for call management
   * @param panel
   */
  $scope.showMapsPanel = function (panel) {
    for (var i = 0; i < $scope.panels.length; i++) {
      $('#' + $scope.panels[i].id).hide();
      $('#tab-' + $scope.panels[i].id).removeClass('active');
    }
    $('#' + panel).show();
    $('#tab-' + panel).addClass('active');

  };
  // initial panel
  $scope.showMapsPanel('maps-travellog');
  $scope.buildTeamInfo();
}


mapCtrl.$inject = ['$scope', '$http'];
