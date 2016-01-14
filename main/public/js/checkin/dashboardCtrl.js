/**
 * Dashboard controller
 * Created by kc on 14.01.16.
 */

'use strict';

function dashboardCtrl($scope, $http) {
  $scope.chancelleryAsset = 0;


  checkinDatastore.dataStore.subscribe('chancellery', function(data) {
    console.log(data);
    $scope.chancelleryAsset = data.asset;
    $scope.$apply();

  });
}

checkinApp.controller('dashboardCtrl', dashboardCtrl);
dashboardCtrl.$inject = ['$scope', '$http'];

