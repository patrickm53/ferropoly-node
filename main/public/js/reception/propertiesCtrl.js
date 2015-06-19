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
  var travelLogLoaded = false;

  $scope.properties = [];
  $scope.listPredicate = 'pricelist.position';
  $scope.reverse = false;
  $scope.currentProperty = {};
  $scope.travelLog = [];

  $scope.updateProperties = function () {
    dataStore.updateProperties(undefined, function () {
      $scope.properties = dataStore.getProperties();
      if (!$scope.currentProperty.location) {
        $scope.currentProperty = $scope.properties[0];
      }
      console.log('propertiesCtrl length: ' + $scope.properties.length);
      $scope.$apply();

      if (!travelLogLoaded) {
        dataStore.updateTravelLog(undefined, function () {
          travelLogLoaded = true;
          $scope.$apply();
        });
      }
    });
  };

  $scope.getTeamName = function (teamId) {
    return dataStore.teamIdToTeamName(teamId);
  };

  $scope.setCurrentProperty = function (property) {
    $scope.currentProperty = property;
    $scope.travelLog = dataStore.getTravelLogForProperty(property.uuid);
  };

  registerPanelUpdateHandler('#panel-properties', $scope.updateProperties);
}


propertiesCtrl.$inject = ['$scope', '$http'];
