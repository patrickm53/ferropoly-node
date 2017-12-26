/**
 * Angular App for the account information
 *
 * Maintain it in the EDITOR PROJECT (not shared source)
 * Created by kc on 29.12.15.
 */

'use strict';
angular.module('accountApp', []).controller('accountCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.data = null;

  // Load the user data of the user the session belongs to
  $http.get('/userinfo').then(
    function (resp) {
      $scope.data = resp.data.info;
    },
    function (resp) {
      console.error('/userinfo', resp);
      genericModals.showError('Fehler', 'Die Accountdaten konnten nicht geaden werden.', resp, function() {
        window.location.href = "/";
      });
    }
  );

  $scope.getRegistrationDate = function () {
    if (!$scope.data) {
      return '';
    }
    return moment($scope.data.info.registrationDate).format('DD.MM.YYYY H:mm');
  };

  /**
   * Get the avatar, return an empty URL if something fails
   * @param index
   * @returns {*}
   */
  $scope.getAvatarUrl = function (index) {
    if (!$scope.data) {
      return '';
    }

    switch (index) {
      case 0:
        if (!$scope.data.personalData.avatar) {
          return $scope.data.info.generatedAvatar;
        }
        return $scope.data.personalData.avatar;
      case 1:
        if (!$scope.data.info.facebook || !$scope.data.info.facebook.photos) {
          return $scope.data.info.generatedAvatar;
        }
        return $scope.data.info.facebook.photos[0].value;
      case 2:
        if (!$scope.data.info.google || !$scope.data.info.google.photos) {
          return $scope.data.info.generatedAvatar;
        }
        return $scope.data.info.google.photos[0].value;
    }

  };

  /**
   * Check if facebook is active
   * @returns {boolean}
   */
  $scope.isFacebookActive = function () {
    if (!$scope.data) {
      return false;
    }
    return ($scope.data.login.facebookProfileId);
  };
  /**
   * Check if google is active
   * @returns {boolean}
   */
  $scope.isGoogleActive = function () {
    if (!$scope.data) {
      return false;
    }
    return ($scope.data.login.googleProfileId);
  };
  /**
   * Check if google is active
   * @returns {boolean}
   */
  $scope.isDropboxActive = function () {
    if (!$scope.data) {
      return false;
    }
    return ($scope.data.login.dropboxProfileId);
  };

  $scope.isMicrosoftActive = function() {
    if (!$scope.data) {
      return false;
    }
    return ($scope.data.login.microsoftProfileId);
  }
}]);
