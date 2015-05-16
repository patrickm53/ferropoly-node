/**
 * Angular controller for the team accounts
 * Created by kc on 14.05.15.
 */
'use strict';

ferropolyApp.controller('teamAccountsCtrl', ['$scope', '$http', function ($scope, $http) {

  $scope.teams = dataStore.getTeams();
  $scope.filter = '{}'; //'{teamId: "' + $scope.teams[0].uuid + '"}';
  console.log($scope.filter);
  $scope.entries = dataStore.getTeamAccountEntries();

  $scope.setTeam = function (teamId) {
    console.log('set team Id: ' + teamId);
    $scope.entries = dataStore.getTeamAccountEntries(teamId);
    console.log('entries: ' + $scope.entries.length);
  };

  ferropolySocket.on('teamAccount', function () {
    // Update scope variable
    $scope.entries = dataStore.getTeamAccountEntries();
    $scope.$apply();
  });
}]);
