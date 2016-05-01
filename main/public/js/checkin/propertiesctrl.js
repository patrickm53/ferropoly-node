/**
 * Properties controller for the check-in
 * Created by kc on 25.01.16.
 */

'use strict';

/**
 * The Checkin properties controller
 * @param $scope
 * @param $http
 */
function propertiesCtrl($scope, $http) {
  $scope.properties = [];

  // properties Updates
  checkinDatastore.dataStore.subscribe('properties', function (data) {
    $scope.properties = data.properties;
    console.log($scope.properties);
    $scope.$apply();
  });
}

checkinApp.controller('propertiesCtrl', propertiesCtrl);
propertiesCtrl.$inject = ['$scope', '$http'];

