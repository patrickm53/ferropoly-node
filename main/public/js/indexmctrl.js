/**
 *
 * Created by kc on 18.04.15.
 */
'use strict';

var indexControl = angular.module('indexApp', []);
indexControl.controller('indexCtrl', ['$scope', '$http', function ($scope, $http) {

  $scope.gameplays = [];
  var authToken;
  $scope.gameplayToDelete;

  /**
   * Get the auttoken (async!)
   */
  var getAuthToken = function () {
    $http.get('/authtoken').
      success(function (data) {
        authToken = data.authToken;
        console.log('Auth ok');
      }).
      error(function (data, status) {
        console.log('error:');
        console.log(data);
        console.log(status);
        $scope.panel = 'error';
        $scope.errorMessage = 'Authentisierungsfehler. Status: ' + status;
      });
  };

  $scope.isGameRunning = function(gp) {
    if (moment(gp.scheduling.gameEndTs).isBefore(moment())) {
      return -1;
    }
    if (moment(gp.scheduling.gameStartTs).isAfter(moment())) {
      return 1;
    }
    // Is running
    return 0;
  };
  $scope.getGpInfo = function (gp) {
    if (moment(gp.scheduling.gameEndTs).isBefore(moment())) {
      return 'Spiel ist seit ' + moment(gp.scheduling.gameEndTs).fromNow(true) + ' zu Ende.';
    }
    if (moment(gp.scheduling.gameStartTs).isAfter(moment())) {
      return 'Spiel startet erst in' + moment(gp.scheduling.gameStartTs).fromNow(true) + '.';
    }
    if (moment().isBetween(moment(gp.scheduling.gameStartTs), moment(gp.scheduling.gameEndTs))) {
      return 'Spiel läuft seit ' + moment(gp.scheduling.gameStartTs).fromNow(true) + '.';
    }
    return ('x');
  };

  // When document ready, load gameplays
  $(document).ready(function () {
    $http.get('/gameplays').
      success(function (data) {
        if (data.success) {
          $scope.gameplays = data.gameplays;
        }
        else {
          $scope.gameplays = [];
        }
        console.log(data);
        console.log('Gameplays loaded, nb:' + $scope.gameplays.length);

        $scope.gameplays.forEach(function (gp) {
          var d = new Date(gp.log.lastEdited);
          console.log(d);
          console.log(gp.log.lastEdited);
        });
        getAuthToken();
      }).
      error(function (data, status) {
        console.log('error:');
        console.log(data);
        console.log(status);
        $scope.gameplays = [];
      });
  });


}]);
