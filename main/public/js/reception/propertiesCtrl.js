/**
 *
 * Created by kc on 15.06.15.
 */
'use strict';

/**
 * The angular controller for the properties statistics
 */
ferropolyApp.controller('propertiesCtrl', propertiesCtrl);
function propertiesCtrl($scope, $http) {
  $scope.properties = [];

  $scope.updateProperties = function() {
    dataStore.updateProperties(undefined, function() {
      $scope.properties = dataStore.getProperties();
      console.log('propertiesCtrl length: ' + $scope.properties.length);
      $scope.$apply();
    });
  };

  $scope.getTeamName = function(teamId) {
    return dataStore.teamIdToTeamName(teamId);
  }

  registerPanelUpdateHandler('#panel-properties', $scope.updateProperties);
}


propertiesCtrl.$inject = ['$scope', '$http'];
