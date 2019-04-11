/**
 * Properties controller for the check-in
 * Created by kc on 25.01.16.
 */

const checkinDatastore = require('../../components/checkin-datastore/')

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


const initProperties = function (app) {
  app.controller('propertiesCtrl', propertiesCtrl);
  propertiesCtrl.$inject = ['$scope'];
};
export {initProperties}


