/**
 * Traffic information
 * Created by kc on 01.09.15.
 */
'use strict';

ferropolyApp.controller('trafficCtrl', trafficCtrl);
function trafficCtrl($scope) {

  $scope.trafficInfo = {};

  $scope.updateTrafficInfo = function() {
    dataStore.getTrafficInfo(function(err, trafficInfo) {
      $scope.trafficInfo = trafficInfo;
      console.log('Traffic info update');
      console.log(trafficInfo);
      $scope.$apply();
    });
  };
  $scope.test = 'ABC';

  $(document).ready(function() {
    $scope.updateTrafficInfo();
  });

}

trafficCtrl.$inject = ['$scope'];

