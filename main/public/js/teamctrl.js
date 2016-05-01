/**
 * Team Member management, adding and removing team members
 * Created by kc on 07.04.16.
 */

'use strict';

var teamCtrl = angular.module('teamApp', []);
teamCtrl.controller('teamCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.members   = [];
  $scope.newMember = '';

  /**
   * Show a successful result
   * @param message
   */
  function showSuccessInfo(message) {
    var lastMessage = message;

    function setMessage(msg) {
      $scope.successMessage = msg;

      _.delay(function() {
        if ($scope.successMessage === lastMessage) {
          $scope.successMessage = '';
          $scope.$apply();
        }
      }, 5000);
    }
    setMessage(message);
  }
  /**
   * Show an errored result
   * @param message
   */
  function showError(message) {
    var lastMessage = message;

    function setMessage(msg) {
      $scope.errorMessage = msg;

      _.delay(function() {
        if ($scope.errorMessage === lastMessage) {
          $scope.errorMessage = '';
          $scope.$apply();
        }
      }, 10000);
    }
    setMessage(message);
  }

  /**
   * Load all team members
   */
  function getTeams() {
    $http({
      method: 'GET',
      url   : '/team/members/' + gameId + '/' + teamId
    }).then(
      function getTeamSuccess(resp) {
        $scope.members = resp.data.members;
        console.log(resp);
      },
      function getTeamError(resp) {
        showError('Fehler beim Laden der Teammitglieder');
        console.error(resp);
      }
    );
  }

  /**
   * Add a team member
   */
  $scope.addMember = function () {
    var newMember    = $scope.newMember;
    $scope.newMember = '';
    if (!newMember || newMember.length < 4) {
      console.warn('No new member found');
      return;
    }

    $http({
      method: 'POST',
      url   : '/team/members/' + gameId + '/' + teamId,
      data  : {
        newMemberLogin: newMember,
        authToken     : $scope.authToken
      }
    }).then(
      function postMemberSuccess(resp) {
        $scope.members = resp.data.members;
        showSuccessInfo(newMember + ' hinzugefügt');
        console.log(resp);
      },
      function postMemberError(resp) {
        showError('Das Teammitglied konnte nicht gespeichert werden');
        console.error(resp);
      }
    );
  };

  /**
   * Remove a member
   */
  $scope.deleteMember = function(memberToDelete) {
    $scope.memberToDelete = memberToDelete;
  };

  /**
   * Delete the member which was confirmed in the modal dialog
   */
  $scope.finallyDelete = function() {
    if (!$scope.memberToDelete) {
      return;
    }

    $http({
      method: 'DELETE',
      url   : '/team/members/' + gameId + '/' + teamId,
      headers: {"Content-Type": "application/json;charset=utf-8"},
      data  : {
        memberToDelete: $scope.memberToDelete.login,
        authToken     : $scope.authToken
      }
    }).then(
      function postMemberSuccess(resp) {
        $scope.members = resp.data.members;
        console.log(resp);
      },
      function postMemberError(resp) {
        showError('Das Teammitglied konnte nicht gelöscht werden');
        console.error(resp);
      }
    );
  };

  // Startup: get data
  $(document).ready(function () {
    $http({method:'GET',
      url: '/authtoken'}).then(function (resp) {
      $scope.authToken = resp.data.authToken;
      console.log('Auth ok');
    },
    function(resp) {
      showError('Wir haben ein Authentisierungsproblem');
      console.error(resp);
    });
    getTeams();
  })

}]);
