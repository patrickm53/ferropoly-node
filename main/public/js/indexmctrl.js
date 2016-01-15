/**
 *
 * Created by kc on 18.04.15.
 */
'use strict';

moment.locale('de');
var indexControl = angular.module('indexApp', []);
indexControl.controller('indexCtrl', ['$scope', '$http', function ($scope, $http) {

  $scope.user             = user;
  $scope.gameplays        = [];
  $scope.games            = [];
  $scope.gameplayToDelete = undefined;


  // Be kind and say hello
  if (moment().hour() < 4) {
    $scope.intro = 'Hallo';
  } else if (moment().hour() < 10) {
    $scope.intro = 'Guten Morgen';
  } else if (moment().hour < 17) {
    $scope.intro = 'Hallo';
  } else {
    $scope.intro = 'Guten Abend';
  }
  var authToken;

  /**
   * Get the auttoken (async!)
   */
  var getAuthToken = function () {
    $http.get('/authtoken').success(function (data) {
      authToken = data.authToken;
      console.log('Auth ok');
    }).error(function (data, status) {
      console.log('error:');
      console.log(data);
      console.log(status);
      $scope.panel        = 'error';
      $scope.errorMessage = 'Authentisierungsfehler. Status: ' + status;
    });
  };

  $scope.isGameRunning = function (gp) {
    if (moment(gp.scheduling.gameEndTs).isBefore(moment())) {
      return -1;
    }
    if (moment(gp.scheduling.gameStartTs).isAfter(moment())) {
      return 1;
    }
    // Is running
    return 0;
  };
  // Get Info about Game timings
  $scope.getGpInfo = function (gp) {
    if (moment(gp.scheduling.gameEndTs).isBefore(moment())) {
      return 'Spiel ist ' + moment(gp.scheduling.gameEndTs).fromNow(false) + ' zu Ende gegangen.';
    }
    if (moment(gp.scheduling.gameStartTs).isAfter(moment())) {
      return 'Spiel startet ' + moment(gp.scheduling.gameStartTs).fromNow(false) + '.';
    }
    if (moment().isBetween(moment(gp.scheduling.gameStartTs), moment(gp.scheduling.gameEndTs))) {
      return 'Spiel startete ' + moment(gp.scheduling.gameStartTs).fromNow(false) + '.';
    }
    return ('');
  };

  /**
   * Returns true when the user is the admin. Otherwise he was just added as secondary admin
   * @param gp
   */
  $scope.userIsAdmin = function (gp) {
    return (gp.internal.owner === $scope.user.personalData.email);
  };
  /**
   * Creates organisator information
   */
  $scope.createOrganisatorInfo = function (gp) {
    var retVal = '';

    if (gp.owner && gp.owner.organisatorName) {
      retVal += gp.owner.organisatorName + ' ';
    }
    retVal += gp.internal.owner;
    return retVal;
  };

  // Functions to get the state about gameplays and games for an user
  $scope.hasNoGamesAtAll      = function () {
    return ($scope.games.length === 0 && $scope.gameplays.length === 0);
  };
  $scope.hasOnlyGameplays     = function () {
    return ($scope.games.length === 0 && $scope.gameplays.length > 0);
  };
  $scope.hasOnlyGames         = function () {
    return ($scope.games.length > 0 && $scope.gameplays.length === 0);
  };
  $scope.hasGamesAndGameplays = function () {
    return ($scope.games.length > 0 && $scope.gameplays.length > 0);
  };
  $scope.hasGameplays         = function () {
    return ($scope.gameplays.length > 0);
  };
  $scope.hasGames             = function () {
    return ($scope.games.length > 0);
  };

  // When document ready, load gameplays
  $(document).ready(function () {

    var index = moment().hours() % 6;
    $('#info-header').css('background-image', 'url("/images/ferropoly_header_0' + index + '.jpg")');

    $http.get('/gameplays').success(function (data) {
      $scope.gameplays = data.gameplays || [];
      $scope.games     = data.games || [];
      console.log(data);
      console.log('Gameplays loaded, nb:' + $scope.gameplays.length);

      $scope.gameplays.forEach(function (gp) {
        var d = new Date(gp.log.lastEdited);
        console.log(d);
        console.log(gp.log.lastEdited);
      });
      getAuthToken();
    }).error(function (data, status) {
      console.log('error:');
      console.log(data);
      console.log(status);
      $scope.gameplays = [];
    });
  });


}]);
