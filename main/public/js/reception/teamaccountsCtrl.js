/**
 * Angular controller for the team accounts
 * Created by kc on 14.05.15.
 */
'use strict';

ferropolyApp.controller('teamAccountsCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.teams = dataStore.getTeams();


  // as we need fast access to the teams name, we cache the names locally
  $scope.teamNames = {};
  for (var i = 0; i < $scope.teams.length; i++) {
    $scope.teamNames[$scope.teams[i].uuid] = $scope.teams[i].data.name;
  }

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


  /**
   * Refresh view, needed when entering it
   */
  $scope.refreshTeamAccounts = function() {
    console.log('refreshTeamAccounts!');
    $scope.setTeam(undefined);
    $scope.$apply();
  };
}]);
