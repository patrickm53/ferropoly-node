/**
 * Angular controller for the team accounts
 * Created by kc on 14.05.15.
 */
'use strict';

ferropolyApp.controller('teamAccountsCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.teams = dataStore.getTeams();
  $scope.currentTeamId = 'undefined';

  // as we need fast access to the teams name, we cache the names locally
  $scope.teamNames = {};
  for (var i = 0; i < $scope.teams.length; i++) {
    $scope.teamNames[$scope.teams[i].uuid] = $scope.teams[i].data.name;
  }

  $scope.filter = '{}'; //'{teamId: "' + $scope.teams[0].uuid + '"}';
  console.log($scope.filter);
  $scope.entries = dataStore.getTeamAccountEntries();

  /**
   * Set the team, get entries, set the panel
   * @param teamId
   */
  $scope.setTeam = function (teamId) {
    $('#account-undefined').removeClass('active');
    for (var i = 0; i < $scope.teams.length; i++){
      $('#account-' + $scope.teams[i].uuid).removeClass('active');
    }
    $('#account-' + teamId).addClass('active');
    console.log('set team Id: ' + teamId);
    $scope.entries = dataStore.getTeamAccountEntries(teamId);
    $scope.currentTeamId = teamId;
    console.log('entries: ' + $scope.entries.length);
  };

  /**
   * URL (last parts) needed for downloading the account csv
   * @returns {string}
   */
  $scope.downloadUrl = function() {
    return  dataStore.getGameplay().internal.gameId + '/' + $scope.currentTeamId;
  };

  /**
   * Socket.io handler, updating the values
   */
  ferropolySocket.on('teamAccount', function () {
    // Update scope variable
    $scope.entries = dataStore.getTeamAccountEntries();
    $scope.$apply();
  });

  $scope.getTransactionInfoText = function(entry) {
    var retVal = entry.transaction.info;
    if (entry.transaction.origin.category === 'team') {
      retVal += ' (' + $scope.teamNames[entry.transaction.origin.uuid] + ')';
    }
    return retVal;
  };
  /**
   * Refresh view, needed when entering it
   */
  $scope.refreshTeamAccounts = function() {
    console.log('refreshTeamAccounts!');
    $scope.setTeam(undefined);
    $scope.$apply();
  };
}]);
