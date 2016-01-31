/**
 *
 * Created by kc on 09.06.15.
 */
'use strict';
var map;

function initializeMap() {
  if (!_.isUndefined(google)) {
    // Create an array of styles.
    var styles =
      [{
        "stylers": [
          {"saturation": -29},
          {"lightness": 38}
        ]
      },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {"visibility": "simplified"}
          ]
        }, {
        "featureType": "transit.station.bus",
        "stylers": [
          {"hue": "#ffff00"},
          {"visibility": "on"}
        ]
      }, {
        "featureType": "administrative.locality",
        "elementType": "labels",
        "stylers": [
          {"visibility": "on"},
          {"weight": 0.1},
          {"color": "#252320"}
        ]
      }, {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
          {"visibility": "off"}
        ]
      }, {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [
          {"visibility": "on"},
          {"weight": 1.6},
          {"color": "#a50f08"}
        ]
      }, {
        "featureType": "transit.station.rail",
        "stylers": [
          {"visibility": "on"},
          {"hue": "#006eff"},
          {"weight": 1.1}
        ]
      }, {
        "featureType": "transit.line",
        "elementType": "geometry.fill",
        "stylers": [
          {"visibility": "on"},
          {"color": "#333333"},
          {"weight": 1.5}
        ]
      }, {
        "featureType": "landscape.natural.landcover"
      }
      ];

    // Create a new StyledMapType object, passing it the array of styles,
    // as well as the name to be displayed on the map type control.
    var styledMap = new google.maps.StyledMapType(styles,
      {name: "Bahnkarte"});

    // Create a map object, and include the MapTypeId to add
    // to the map type control.
    var mapOptions = {
      zoom: 8,
      center: new google.maps.LatLng(47.29725, 8.867215),

      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
      }
    };

    console.log(document.getElementById('map_canvas'));
    map = new google.maps.Map(document.getElementById('map_canvas'),
      mapOptions);

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');
  }
}
/**
 * Load map when ready
 */
$(document).ready(function () {
  initializeMap();
});

/**
 * Refresh map panel when activating it
 */
function refreshMapPanel() {
  if (_.isUndefined(google)) {
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
 * @param position
 * @param color
 * @returns {google.maps.Circle}
 */
function createTravelLogMarker(position, color, radiusFactor) {
  var markerOptions = {
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: color,
    fillOpacity: 0.35,
    map: map,
    center: new google.maps.LatLng(position.lat, position.lng),
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
  if (_.isUndefined(google)) {
    return;
  }

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

  $scope.travelLogAll = false;
  $scope.travelLogMarkers = [];
  $scope.teams = [];
  $scope.activePanel = 'none';
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
        displayOnMap: false
      });
    }
  };

  /**
   * The main switch for showing all on travel log
   */
  $scope.enableTravelLogAll = function () {
    for (var i = 0; i < $scope.teams.length; i++) {
      $scope.teams[i].displayOnMap = $scope.travelLogAll;
    }
    $scope.drawTravelLog();
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
   * Update handler when activating the tab
   */
  $scope.updateMap = function () {
    if ($scope.activePanel === 'maps-travellog') {
      $scope.drawTravelLog();
    }
  };
  /**
   * Draw the travel log on the map
   */
  $scope.drawTravelLog = function () {
    if ($scope.activePanel !== 'maps-travellog') {
      return;
    }
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
          if (log[t].position) {
            line.push(new google.maps.LatLng(log[t].position.lat, log[t].position.lng));
            $scope.travelLogMarkers.push({
              teamId: log[t].teamId,
              marker: createTravelLogMarker({lat:log[t].position.lat, lng:log[t].position.lng}, dataStore.getTeamColor(log[t].teamId), factor * (t + 1))
            });

            $scope.travelLines.push(drawTeamTravelLine(line, dataStore.getTeamColor(log[t].teamId)));
          }
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
    if (_.isUndefined(google)) {
      return;
    }
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
    $scope.activePanel = panel;
  };
  // initial panel
  $scope.showMapsPanel('maps-travellog');
  $scope.buildTeamInfo();
  registerPanelUpdateHandler('#panel-map', $scope.updateMap);

}


