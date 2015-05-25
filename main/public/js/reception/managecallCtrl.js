/**
 * Controller for the manage call page
 * Created by kc on 16.05.15.
 */
'use strict';

ferropolyApp.controller('managecallCtrl', managecallCtrl);
function managecallCtrl($scope) {

  // Pagination
  $scope.itemsPerPage = 6;
  $scope.currentPage = 0;
  // Property Query
  $scope.propertyQuery = '';
  $scope.propertyQueryResult = [];
  // General
  $scope.teams = dataStore.getTeams();
  $scope.callPanel = 0;
  $scope.preselectedTeam = undefined;
  $scope.selectedTeam = activeCall.getCurrentTeam();
  $scope.teamInfo = {
    numberOfProperties: 0,
    balance: 0,
    accountEntries: [],
    properties: [],
    lastActions: []
  };

  $scope.propertyInvestCandidate = undefined;

  /**
   * Local function for pushing an event
   * @param text
   */
  function pushEvent(text) {
    dataStore.pushEvent(activeCall.getCurrentTeam().uuid, text);
  }

  /**
   * Show the correct panel for call management
   * @param panel
   */
  $scope.showCallPanel = function(panel) {
    $('#possessions').hide();
    $('#buy').hide();
    $(panel).show();
  };

  /**
   * Returns the refreshed active team
   * @returns {*}
   */
  $scope.refreshActiveTeam = function () {
    $scope.selectedTeam = activeCall.getCurrentTeam();
    return $scope.selectedTeam;
  };

  /**
   * Preselect: we intend to work with this team, but it has to be confirmed
   * @param team
   */
  $scope.preselectTeam = function (team) {
    console.log(team.data.name + ' / ' + team.uuid);
    $scope.preselectedTeam = team;
    // It's time to update the data!
    dataStore.updateChancellery();
    dataStore.updateProperties();
    dataStore.updateTeamAccountEntries(undefined, function () {
      console.log('update received for teamAccount: ' + team.uuid);
      $scope.teamInfo.balance = dataStore.getTeamAccountBalance(team.uuid);
      $scope.teamInfo.accountEntries = dataStore.getTeamAccountEntries(team.uuid);
      $scope.teamInfo.properties = dataStore.getProperties(team.uuid);
      $scope.lastActions = [];
      $scope.$apply();
    });
  };

  /**
   * Confirm using this team
   * @param playChancellery
   */
  $scope.confirmTeam = function (playChancellery) {
    console.log('Chancellery: ' + playChancellery);
    activeCall.setCurrentTeam($scope.preselectedTeam);
    $scope.selectedTeam = $scope.preselectedTeam;
    $scope.preselectedTeam = undefined;
    $scope.callPanel = 2;
    $scope.showCallPanel('#buy');
  };

  /**
   * Finish the call and go back to the main screen
   */
  $scope.finishCall = function () {
    $scope.callPanel = 0;
    // Reset info, avoid that another call displays the data during fetching it
    $scope.teamInfo.numberOfProperties = 0;
    $scope.teamInfo.balance = 0;
    $scope.teamInfo.accountEntries = [];
    $scope.teamInfo.lastActions = [];
    $scope.currentPage = 0;
    $scope.propertyQuery = '';
    $scope.propertyQueryResult = [];
    $scope.selectedTeam = undefined;
    $scope.preselectedTeam = undefined;
    activeCall.finish();
  };

  /**
   * Buy houses for all properties of this team
   */
  $scope.buyHouses = function () {
    ferropolySocket.emit('marketplace', {
      cmd: 'buyHouses',
      teamId: activeCall.getCurrentTeam().uuid
    });
    console.log('buyHouses request pending');
    pushEvent('Bauanfrage für ' + activeCall.getCurrentTeam().data.name + ' (' + activeCall.getCurrentTeam().uuid + ') übermittelt');
  };

  /**
   * Pagination for User Account Info
   * http://fdietz.github.io/recipes-with-angular-js/common-user-interface-patterns/paginating-through-client-side-data.html
   */
  $scope.prevPage = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
    }
  };
  $scope.prevPageDisabled = function () {
    return $scope.currentPage === 0 ? "disabled" : "";
  };
  $scope.pageCount = function () {
    return Math.ceil($scope.teamInfo.accountEntries.length / $scope.itemsPerPage);
  };
  $scope.nextPage = function () {
    if ($scope.currentPage < $scope.pageCount()) {
      $scope.currentPage++;
    }
  };
  $scope.nextPageDisabled = function () {
    return $scope.currentPage === ($scope.pageCount() - 1) ? "disabled" : "";
  };
  $scope.setPage = function (n) {
    $scope.currentPage = n;
  };
  $scope.range = function () {
    var rangeSize = 8;
    var ret = [];
    var start;

    start = $scope.currentPage;
    if (start > $scope.pageCount() - rangeSize) {
      start = $scope.pageCount() - rangeSize;
    }
    if (start < 0) {
      start = 0;
    }
    for (var i = start; i < start + rangeSize && i < $scope.pageCount(); i++) {
      ret.push(i);
    }
    return ret;
  };
  /**
   * Query on property find
   */
  $scope.runPropertyQuery = function () {
    $scope.propertyQueryResult = dataStore.searchProperties($scope.propertyQuery, 8);
  };
  /**
   * Set the property invest candidate, which has to be confirmed
   * @param candidate
   */
  $scope.setPropertyInvestCandidate = function (candidate) {
    $scope.propertyInvestCandidate = candidate;
  };
  $scope.buyProperty = function (property) {
    ferropolySocket.emit('marketplace', {
      cmd: 'buyProperty',
      propertyId: property.uuid,
      teamId: activeCall.getCurrentTeam().uuid
    });
    console.log('request pending');
    pushEvent('Kaufanfrage für ' + property.location.name + ' übermittelt');
  };


  /***********************
   * SOCKET EVENT HANDLERS
   */
  ferropolySocket.on('marketplace', function (resp) {
    switch (resp.cmd) {
      case 'buyProperty':
        if (resp.err) {

        }
        else if (resp.result.amount > 0) {
          // bought

        }
        else if (resp.result.amount === 0) {
          // already own
        }
        else {
          // belongs to other
        }
        console.log('see what happened when buying this');
        break;

      case 'buyHouses':
        console.log('Houses built');
        console.log(resp);
        break;
    }
  });
  ferropolySocket.on('teamAccount', function (resp) {
    if ($scope.selectedTeam) {
      $scope.teamInfo.balance = dataStore.getTeamAccountBalance($scope.selectedTeam.uuid);
      $scope.teamInfo.accountEntries = dataStore.getTeamAccountEntries($scope.selectedTeam.uuid);
      $scope.$apply();
    }
  });
}

managecallCtrl.$inject = ['$scope'];
