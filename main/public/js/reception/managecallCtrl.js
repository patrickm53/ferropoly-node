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

  $scope.preselectTeam = function(team) {
    console.log(team);
    $scope.preselectedTeam = team;
  }


}

managecallCtrl.$inject = ['$scope'];
