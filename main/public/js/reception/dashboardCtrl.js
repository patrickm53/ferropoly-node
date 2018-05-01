/**
 * Angular dashboard controller
 * Created by kc on 28.05.15.
 */
'use strict';

ferropolyApp.controller('dashboardCtrl', dashboardCtrl);
function dashboardCtrl($scope) {
  ///// RANKING LIST
  $scope.rankingList        = [];
  $scope.teamIdToTeamName   = dataStore.teamIdToTeamName;
  $scope.rankingListLoaded  = false;
  $scope.rankingListWaiting = false;

  $scope.refresh = function () {
    $scope.refreshRankingList();
    $scope.updateTrafficInfo();
  };

  $scope.refreshRankingList = function () {
    dataStore.getRankingList(function (err, list) {
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


  ///// TRAFFIC
  $scope.trafficInfo       = {};
  $scope.trafficInfoLoaded = false;

  $scope.updateTrafficInfo = function (callback) {
    dataStore.getTrafficInfo({
      delay       : true,
      construction: true,
      restriction : true,
      limit       : 8,
      onlyCurrent : false
    }, function (err, trafficInfo) {
      $scope.trafficInfo       = trafficInfo;
      $scope.trafficInfoLoaded = true;
      console.log(trafficInfo);
      if (callback) {
        callback();
      }
    });
  };


  //// Gameplay info
  $scope.gp = dataStore.getGameplay();


  $(document).ready(function () {
    $scope.refreshRankingList();
    $scope.updateTrafficInfo(function () {
      $scope.$apply();
    });

    dataStore.registerTeamAccountUpdateHandler(function () {
      // get Rankinglist only with a delay, not all bookings shall update
      if ($scope.rankingListWaiting) {
        console.log('Waiting for ranking list...');
        return;
      }
      $scope.rankingListWaiting = true;
      _.delay(function () {
        dataStore.getRankingList(function (err, list) {
          $scope.rankingListWaiting = false;
          if (err) {
            console.error(err);
          }
          else {
            $scope.rankingList = list;
            console.log('Rankinglist updated');
          }
          $scope.$apply();
        });
      }, 5000);

    });
  });
}

dashboardCtrl.$inject = ['$scope'];

