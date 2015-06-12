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

  _.delay(function () {
    // Force the update
    google.maps.event.trigger(map, 'resize');
    var center = dataStore.getMapCenter();
    map.setCenter(new google.maps.LatLng(center.lat, center.lng))
  }, 250);
}

function createTravelLogMarker(property, color) {
  var markerOptions = {
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: color,
    fillOpacity: 0.35,
    map: map,
    center: new google.maps.LatLng(parseFloat(property.location.position.lat), parseFloat(property.location.position.lng)),
    radius: 4000
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
        name: dataStore.teams[i].data.name,
        color: dataStore.getTeamColor(teams[i].uuid),
        displayOnMap: true,
        drawTravelLog: function () {
          drawTravelLog(teams[i].uuid);
        },
        removeTravelLogMarkers: function () {
          $scope.deleteTravelLogMarkers(teams[i].uuid);
        }
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
   * Draw the travel log for one or all teams
   * @param teamId
   */
  $scope.drawTravelLog = function (teamId) {
    console.log('drawTravelLog for ' + teamId);
    if (!teamId) {
      var teams = dataStore.getTeams();
      for (var t = 0; t < teams.length; t++) {
        $scope.drawTravelLog(teams[t].uuid);
      }
      return;
    }
    // remove old markers of the team first
    $scope.deleteTravelLogMarkers(teamId);
    var log = dataStore.getTravelLog(teamId);
    for (var i = 0; i < log.length; i++) {
      $scope.travelLogMarkers.push({
        teamId: teamId,
        marker: createTravelLogMarker(dataStore.getPropertyById(log[i].propertyId), dataStore.getTeamColor(teamId))
      });
    }
  };

  /**
   * Delete the travel log markers for a given team
   * @param teamId
   */
  $scope.deleteTravelLogMarkers = function (teamId) {
    var removedElements = _.remove($scope.travelLogMarkers, {teamId: teamId});
    for (var i = 0; i < removedElements.length; i++) {
      removedElements[i].marker.setMap(null);
    }
  }
}


mapCtrl.$inject = ['$scope', '$http'];
