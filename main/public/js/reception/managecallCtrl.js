/**
 * Controller for the manage call page
 * Created by kc on 16.05.15.
 */
'use strict';


ferropolyApp.controller('managecallCtrl', managecallCtrl);
function managecallCtrl($scope) {

  $scope.teams = dataStore.getTeams();

  $scope.callPanel = 0;

  $scope.preselectedTeam = undefined;
  $scope.selectedTeam = activeCall.getCurrentTeam();

  $scope.preselectTeam = function(team) {
    console.log(team);
    $scope.preselectedTeam = team;
  };

  $scope.confirmTeam = function(playChancellery) {
    console.log('Chancellery: ' + playChancellery);
    activeCall.setCurrentTeam($scope.preselectedTeam);
    $scope.selectedTeam = $scope.preselectedTeam;
    $scope.preselectedTeam = undefined;
    $scope.callPanel = 2;
  };


}

managecallCtrl.$inject = ['$scope'];
