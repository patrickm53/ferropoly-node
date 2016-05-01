/**
 * The controller for the summary page
 * Created by kc on 27.04.16.
 */

'use strict';

/**
 * Panel handling
 */
var panels = ['#panel-main', '#panel-team', '#panel-chancellery'];
function showPanel(panel) {
  panels.forEach(function (p) {
    $(p).hide();
  });
  $(panel).show();
}

// The Angular app
var app = angular.module('summaryApp', []);

/**
 * This is the amount filter returning nicer values
 */
app.filter('amount', function () {
  return function (val) {
    if (_.isNumber(val)) {
      return val.toLocaleString('de-CH');
    }
    return val;
  }
});

var mapApiLoaded = false;
function initMap() {
  mapApiLoaded = true;
}

/**
 * The controller
 */
app.controller('summaryCtrl', ['$scope', '$http', function ($scope, $http) {
  console.log(info);
  $scope.info    = info;
  $scope.markers = [];
  $scope.map;


  /**
   * Prepare Data for the view
   */
  function prepareData() {
    if ($scope.info.error) {
      console.error(info.error);
      return;
    }
    // Set Teams Object
    $scope.teams = {};
    for (var i = 0; i < info.teams.length; i++) {
      $scope.teams[info.teams[i].teamId]          = info.teams[i];
      $scope.teams[info.teams[i].teamId].gamedata = {
        properties: [],
        buildings : 0
      }
    }
    // Set pricelist
    $scope.info.rankingList = _.orderBy($scope.info.rankingList, ['asset'], ['desc']);
    for (i = 0; i < $scope.info.rankingList.length; i++) {
      $scope.info.rankingList[i].team = $scope.teams[$scope.info.rankingList[i]._id];
    }
    // Count properties
    $scope.propertiesBought = 0;
    $scope.propertiesFree   = 0;
    $scope.housesBuilt      = 0;
    for (i = 0; i < $scope.info.properties.length; i++) {
      if ($scope.info.properties[i].gamedata.owner) {
        $scope.propertiesBought++;
        $scope.housesBuilt += $scope.info.properties[i].gamedata.buildings;
        $scope.teams[$scope.info.properties[i].gamedata.owner].gamedata.properties.push($scope.info.properties[i]);
        $scope.teams[$scope.info.properties[i].gamedata.owner].gamedata.buildings += $scope.info.properties[i].gamedata.buildings;
      }
    }
    // Set saldo on chancellery data
    setSaldo($scope.info.chancellery);
  }

  /**
   * Sets the saldo on a  transaction list
   * @param list
   */
  function setSaldo(list) {
    if (list.length > 0) {
      list[0].saldo = list[0].transaction.amount;
      for (var i = 1; i < list.length; i++) {
        list[i].saldo = list[i - 1].saldo + list[i].transaction.amount;
      }
    }
  }

  /**
   * Shows the selected team
   * @param team
   */
  $scope.showTeam = function (team) {
    $scope.team = team;
    showPanel('#panel-team');

    // Create datasets for this team
    // Properties
    $scope.teamProperties   = _.filter($scope.info.properties, function (e) {
      return e.gamedata.owner === team.teamId;
    });
    // Team Transactions
    $scope.teamTransactions = _.filter($scope.info.teamTransactions, {'teamId': team.teamId});
    setSaldo($scope.teamTransactions);
    // Travel Log
    $scope.teamTravelLog = _.filter($scope.info.travelLog, {'teamId': team.teamId});

    $scope.teamTravelLog.forEach(function (t) {
      if (t.propertyId) {
        t.property = _.find($scope.info.properties, {'uuid': t.propertyId});
      }
    });
    drawTravelLog();

    console.log($scope.teamTravelLog);
  };

  /**
   * Focus the location on the map
   * @param travelLogEntry
   */
  $scope.focusOnMap = function (travelLogEntry) {
    console.log(travelLogEntry);
  };

  // make sure all data is available
  prepareData();
  showPanel('#panel-main');

  //////////////////////////////////
  // All the things about the map
  function drawTravelLog() {
    $scope.markers.forEach(function (m) {
      m.setMap(null);
    });
    $scope.markers = [];

    // Draw markers for all the teams properties
    $scope.bounds = new google.maps.LatLngBounds();
    $scope.teamProperties.forEach(function (p) {
      var marker     = new google.maps.Marker({
        position: {lat: parseFloat(p.location.position.lat), lng: parseFloat(p.location.position.lng)},
        map     : $scope.map,
        title   : 'Hello World!'
      });
      var infowindow = new google.maps.InfoWindow({
        content: p.location.name
      });
      marker.addListener('click', function () {
        infowindow.open($scope.map, marker);
      });
      $scope.bounds.extend(marker.getPosition());
      // console.log('marker', marker.getPosition().lng(), marker.getPosition().lat());
      $scope.markers.push(marker);
    });
    $scope.map.fitBounds($scope.bounds);

    // Draw the line
    var cords = [];
    $scope.teamTravelLog.forEach(function (m) {
      cords.push({lat: parseFloat(m.position.lat), lng: parseFloat(m.position.lng)});
    });
    if ($scope.travelPath) {
      $scope.travelPath.setMap(null);
    }
    $scope.travelPath = new google.maps.Polyline({
      path         : cords,
      geodesic     : true,
      strokeColor  : '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight : 2
    });

    $scope.travelPath.setMap($scope.map);
  }

  $(document).ready(function () {
    function initMap() {
      if (!mapApiLoaded) {
        _.delay(initMap, 500);
      }


      $scope.map = new google.maps.Map(document.getElementById('travel-map'), {
        zoom  : 10,
        center: {lat: 47.320293, lng: 8.794331}
      });
    }

    initMap();

  });

  /**
   * Refreshing the map: when changing the view google maps does not refresh itself. This must be enforced
   * by a "resize" call
   * @param id
   */
  $scope.refreshMap = function () {
    _.delay(function () {
      // Force the update
      console.log('Map resize triggered');
      google.maps.event.trigger($scope.map, 'resize');
      drawTravelLog();
    }, 500);
  }

}]);
