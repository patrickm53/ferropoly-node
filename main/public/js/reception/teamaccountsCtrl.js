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
    $scope.currentTeamId = teamId;
  };

  /**
   * URL (last parts) needed for downloading the account csv
   * @returns {string}
   */
  $scope.downloadUrl = function() {
    return  dataStore.getGameplay().internal.gameId;
  };

  $scope.getTransactionInfoText = function(entry) {
    var retVal = entry.transaction.info;
    if (entry.transaction.origin.category === 'team') {
      retVal += ' (' + $scope.teamNames[entry.transaction.origin.uuid] + ')';
    }
    return retVal;
  };

  /**
   * Filter for the account list
   * @param entry
   * @returns {boolean}
   */
  $scope.accountFilter = function(entry) {
    if (!$scope.currentTeamId) {
      return true;
    }
    return entry.teamId === $scope.currentTeamId;
  };

  var newTransactionHandler = function() {
    // Just update the entries
   /* dataStore.updateTeamAccountEntries(undefined, function(err, entries) {
       $scope.entries = entries;
       $scope.$apply();
    });*/
  };

  // Register the handler for Team account transaction changes
  dataStore.registerTeamAccountUpdateHandler(newTransactionHandler);

  /**
   * Refresh view, needed when entering it
   */
  $scope.refreshTeamAccounts = function() {
    console.log('refreshTeamAccounts!');
    $scope.entries = dataStore.getTeamAccountEntries();
    $scope.setTeam(undefined);
    $scope.$apply();
  };
}]);
