/**
 * The controller for the summary page
 * Created by kc on 27.04.16.
 */

'use strict';

/**
 * Panel handling
 */
var panels = ['#panel-main', '#panel-team'];
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
  }

  /**
   * Shows the selected team
   * @param team
   */
  $scope.showTeam = function (team) {
    $scope.team = team;
    showPanel('#panel-team');

    // Create datasets for this team
    $scope.teamProperties   = _.filter($scope.info.properties, function (e) {
      return e.gamedata.owner === team.teamId;
    });
    $scope.teamTransactions = _.filter($scope.info.teamTransactions, {'teamId': team.teamId});
    console.log($scope.teamTransactions);
  };


  // make sure all data is available
  prepareData();
  showPanel('#panel-main');
}]);
