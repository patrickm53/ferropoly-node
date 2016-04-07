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
  } else if (moment().hour() < 17) {
    $scope.intro = 'Hallo';
  } else {
    $scope.intro = 'Guten Abend';
  }
  var authToken;

  /**
   * Get the auttoken (async!)
   */
  var getAuthToken = function () {
    $http({
      method: 'GET',
      url   : '/authtoken'
    }).then(function (resp) {
      authToken = resp.data.authToken;
      console.log('Auth ok');
    }, function (resp) {
      console.error(resp);
      $scope.panel        = 'error';
      $scope.errorMessage = 'Authentisierungsfehler. Status: ' + resp.status;
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
  $scope.getGpInfo     = function (gp) {
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
  $scope.isTeamleader         = function (game) {
    return _.get(game, 'team.data.teamLeader.email', 'x') === _.get(user, 'personalData.email');
  };

  // When document ready, load gameplays
  $(document).ready(function () {

    var index = moment().hours() % 6;
    $('#info-header').css('background-image', 'url("/images/ferropoly_header_0' + index + '.jpg")');

    $http({
      method: 'GET',
      url   : '/gameplays'
    }).then(function (resp) {
      // OK Case
      $scope.gameplays = resp.data.gameplays || [];
      $scope.games     = resp.data.games || [];
      console.log('Gameplays loaded, nb:' + $scope.gameplays.length);
      console.log('Games loaded, nb:' + $scope.games.length);
      getAuthToken();
    }, function (resp) {
      // Error case
      console.error(resp);
      $scope.gameplays    = [];
      $scope.panel        = 'error';
      $scope.errorMessage = 'Spiele konnten nicht geladen werden. Status: ' + resp.status;
    });

  });


}]);
