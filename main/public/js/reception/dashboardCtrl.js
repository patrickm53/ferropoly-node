/**
 * Angular dashboard controller
 * Created by kc on 28.05.15.
 */
'use strict';

ferropolyApp.controller('dashboardCtrl', dashboardCtrl);
function dashboardCtrl($scope, $http) {
  $scope.rankingList = [];
  $scope.teamIdToTeamName = dataStore.teamIdToTeamName;
  $scope.rankingListLoaded = false;

  $scope.refreshRankingList = function() {
    dataStore.getRankingList(function(err, list) {
      if (err) {
        console.log('Error while getting ranking list: ' + err.message);
        $scope.rankingList = [];
      }
      else {
        $scope.rankingList = list;
      }
      $scope.rankingListLoaded = true;
      $scope.$apply();
      console.log('Ranking list received');
      console.log($scope.rankingList);
    });
  };

  // Init state
  $scope.refreshRankingList();
}

dashboardCtrl.$inject = ['$scope', '$http'];

