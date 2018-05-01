/**
 * Chancellery: show amount and transactions
 * Created by kc on 15.06.15.
 */
'use strict';


/**
 * The angular controller for the chancellery
 */
ferropolyApp.controller('chanceCtrl', chanceCtrl);
function chanceCtrl($scope) {
  $scope.entries = [];
  $scope.teams = dataStore.getTeams();
  $scope.chancelleryAsset = 0;

  // as we need fast access to the teams name, we cache the names locally
  $scope.teamNames = {};
  for (var i = 0; i < $scope.teams.length; i++) {
    $scope.teamNames[$scope.teams[i].uuid] = $scope.teams[i].data.name;
  }
  /**
   * Update handler
   */
  $scope.updateData = function () {
    dataStore.updateChancellery(function () {
      $scope.entries = dataStore.getChancelleryEntries();
      $scope.chancelleryAsset = dataStore.getChancelleryAsset();
      $scope.$apply();
    });
  };
  registerPanelUpdateHandler('#panel-chance', $scope.updateData);

}


chanceCtrl.$inject = ['$scope'];
