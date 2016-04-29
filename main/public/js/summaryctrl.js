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


/**
 * The controller
 */
app.controller('summaryCtrl', ['$scope', '$http', function ($scope, $http) {
  console.log(info);
  $scope.info = info;

  /**
   * Prepare Data for the view
   */
  function prepareData() {
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
}]);
