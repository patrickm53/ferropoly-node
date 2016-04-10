/**
 *
 * Created by kc on 07.04.16.
 */

'use strict';

var teamCtrl = angular.module('teamApp', []);
teamCtrl.controller('teamCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.members   = [];
  $scope.newMember = '';

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
        console.log(resp);
      },
      function postMemberError(resp) {
        console.error(resp);
      }
    );
  };

  /**
   * Remove a member
   */
  $scope.deleteMember = function(memberToDelete) {
    $http({
      method: 'DELETE',
      url   : '/team/members/' + gameId + '/' + teamId,
      headers: {"Content-Type": "application/json;charset=utf-8"},
      data  : {
        memberToDelete: memberToDelete.login,
        authToken     : $scope.authToken
      }
    }).then(
      function postMemberSuccess(resp) {
        $scope.members = resp.data.members;
        console.log(resp);
      },
      function postMemberError(resp) {
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
      console.error(resp);
    });
    getTeams();
  })

}]);
