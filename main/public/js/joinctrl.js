/**
 *
 * Created by kc on 05.02.16.
 */

'use strict';
angular.module('joinApp', []).controller('joinCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.gameplay = gameplay;


  /**
   * Is a game found fitting for this page?
   * @returns {*}
   */
  $scope.isGameFound = function() {
    return ($scope.gameplay && $scope.gameplay._id);
  };

  $scope.isJoiningAllowed = function() {
    if (!$scope.isGameFound()) {
      return false;
    }
    return true;
  };

  $scope.showGameNotFoundPanel = function() {
    return !$scope.isGameFound();
  };

  $scope.showJoiningNotAllowedPanel = function() {
    return $scope.isGameFound() && !$scope.isJoiningAllowed();
  };

  $scope.showJoiningPanel = function() {
    return $scope.isGameFound() && $scope.isJoiningAllowed();
  }

}]);
