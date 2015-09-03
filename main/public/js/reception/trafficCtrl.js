/**
 * Traffic information
 * Created by kc on 01.09.15.
 */
'use strict';

ferropolyApp.controller('trafficCtrl', trafficCtrl);
function trafficCtrl($scope) {

  $scope.trafficInfo = {};
  $scope.showDelay = true;
  $scope.showRestriction = true;
  $scope.showConstruction = true;
  $scope.showOnlyCurrent = false;

  $scope.updateTrafficInfo = function (callback) {
    dataStore.getTrafficInfo({
      delay: $scope.showDelay,
      restriction: $scope.showRestriction,
      construction: $scope.showConstruction,
      onlyCurrent: $scope.showOnlyCurrent
    }, function (err, trafficInfo) {
      $scope.trafficInfo = trafficInfo;
      console.log(trafficInfo);
      if (callback) {
        callback();
      }
    });
  };


  $(document).ready(function () {
    $scope.updateTrafficInfo(function() {
      $scope.$apply();
    });
  });

}

trafficCtrl.$inject = ['$scope'];

