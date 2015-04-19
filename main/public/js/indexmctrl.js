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
