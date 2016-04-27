/**
 * The controller for the summary page
 * Created by kc on 27.04.16.
 */

'use strict';
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
      $scope.teams[info.teams[i].teamId] = info.teams[i];
    }
    // Set pricelist
    $scope.info.rankingList = _.orderBy($scope.info.rankingList, ['asset'], ['desc']);
    for (i = 0; i < $scope.info.rankingList.length; i++) {
      $scope.info.rankingList[i].team = $scope.teams[$scope.info.rankingList[i]._id];
    }
    console.log($scope.info.rankingList);
    console.log($scope.teams);
   
  }


  prepareData();
}]);
