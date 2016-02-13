/**
 *
 * Created by kc on 05.02.16.
 */

'use strict';
angular.module('joinApp', ['ngSanitize']).controller('joinCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.gameplay        = gameplay;
  $scope.teamName        = team.name;
  $scope.organization    = team.organization;
  $scope.teamLeaderPhone = team.phone;
  $scope.remarks         = team.remarks;
  $scope.teamInfo        = team;
  $scope.saved           = false;

  var authToken = '123';

  // For displaying purposes only, will be set on the server side to avoid local manipulation
  $scope.teamLeaderName  = user.personalData.forename + ' ' + user.personalData.surname;
  $scope.teamLeaderEmail = user.personalData.email;

  /**
   * Is a game found fitting for this page?
   * @returns {*}
   */
  $scope.isGameFound = function () {
    return ($scope.gameplay && $scope.gameplay._id);
  };

  $scope.isJoiningAllowed = function () {
    if (!$scope.isGameFound()) {
      return false;
    }
    if (!$scope.gameplay.joining || !$scope.gameplay.joining.possibleUntil) {
      return false;
    }
    if (moment().isAfter($scope.gameplay.joining.possibleUntil) || ( $scope.gameplay.scheduling.gameStartTs && moment().isAfter($scope.gameplay.scheduling.gameStartTs))) {
      return false
    }
    return true;
  };

  $scope.showGameNotFoundPanel = function () {
    return !$scope.isGameFound();
  };

  $scope.showJoiningNotAllowedPanel = function () {
    return $scope.isGameFound() && !$scope.isJoiningAllowed();
  };

  $scope.showJoiningPanel = function () {
    return $scope.isGameFound() && $scope.isJoiningAllowed();
  };

  $scope.save = function () {
    $http({
      method: 'POST',
      url   : '/join/' + gameplay.internal.gameId,
      data  : {
        authToken   : authToken,
        teamName    : $scope.teamName,
        organization: $scope.organization,
        phone       : $scope.teamLeaderPhone,
        remarks     : $scope.remarks
      }
    }).then(
      function (resp) {
        $scope.saved = true;
        console.log(resp);
      },
      function (resp) {
        if (resp.data) {
          $scope.error = 'Fehler beim Speichern, Status: ' + resp.status + ' Meldung: ' + resp.data.message;
        }
        else {
          $scope.error = 'Unbekannter Fehler beim Speichern, möglicherweise ist der Server gerade nicht verfügbar.';
        }
        console.error(resp);
      }
    );
  };

  $(document).ready(function () {
    $http({method: 'GET', url: '/authtoken'}).then(
      function (resp) {
        authToken = resp.data.authToken;
      },
      function (resp) {
        if (resp.data) {
          $scope.error = 'Das AccessToken konnte nicht geladen werden, Status: ' + resp.status + ' Meldung: ' + resp.data.message;
        }
        else {
          $scope.error = 'Das AccessToken konnte nicht geladen werden, möglicherweise ist der Server gerade nicht verfügbar.';
        }
        console.error(resp);
      }
    )
  });

}]);
