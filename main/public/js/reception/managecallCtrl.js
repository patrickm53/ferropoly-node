/**
 * Controller for the manage call page
 * Created by kc on 16.05.15.
 */
'use strict';

ferropolyApp.controller('managecallCtrl', managecallCtrl);
function managecallCtrl($scope, $http) {

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
    callLog: []
  };
  $scope.propertyInvestCandidate = undefined;

  $scope.isGameActive = function () {
    return dataStore.isGameActive();
  }

  /**
   * Local function for pushing an event
   * @param text
   */
  function pushEvent(text) {
    dataStore.pushEvent(activeCall.getCurrentTeam().uuid, text);
  }

  $scope.getTeamColor = function (teamId) {
    return dataStore.getTeamColor(teamId);
  };
  $scope.getPropertyName = function (propertyId) {
    return dataStore.getPropertyById(propertyId).location.name;
  };
  /**
   * Show the correct panel for call management
   * @param panel
   */
  $scope.showCallPanel = function (panel) {
    $('#possessions').hide();
    $('#buy').hide();
    $('#log').hide();
    $('#tab-possessions').removeClass('active');
    $('#tab-buy').removeClass('active');
    $('#tab-log').removeClass('active');
    $('#' + panel).show();
    $('#tab-' + panel).addClass('active');
  };

  /**
   * Returns the refreshed active team
   * @returns {*}
   */
  $scope.refreshActiveTeam = function () {
    $scope.selectedTeam = activeCall.getCurrentTeam();
    return $scope.selectedTeam;
  };
  $scope.refreshAccountInfo = function (team) {
    if (!team) {
      team = $scope.selectedTeam;
    }
    dataStore.updateTeamAccountEntries(team.uuid, function () {
      console.log('update received for teamAccount: ' + team.uuid);
      $scope.teamInfo.balance = dataStore.getTeamAccountBalance(team.uuid);
      $scope.teamInfo.accountEntries = dataStore.getTeamAccountEntries(team.uuid);
      $scope.setPage(5000); // last page
      $scope.$apply();
    });
  };
  $scope.refreshProperties = function (team) {
    if (!team) {
      team = $scope.selectedTeam;
    }
    dataStore.updateProperties(team.uuid, function () {
      $scope.teamInfo.properties = dataStore.getProperties(team.uuid);
      console.log('Properties', $scope.teamInfo.properties);
      dataStore.updateTravelLog(team.uuid, function () {
        $scope.teamInfo.travelLog = dataStore.getTravelLog(team.uuid);
        $scope.$apply();
      });
    });
  };
  /**
   * Preselect: we intend to work with this team, but it has to be confirmed
   * @param team
   */
  $scope.preselectTeam = function (team) {
    console.log(team.data.name + ' / ' + team.uuid);
    $scope.preselectedTeam = team;
    $scope.callLog = [];
    $scope.gambleAmount = 0;
    // It's time to update the data!
    dataStore.updateChancellery();
    $scope.refreshProperties(team);
    $scope.refreshAccountInfo(team);
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

    if (playChancellery) {
      // Play chancellery in every standard call
      $http.get('/chancellery/play/' + dataStore.getGameplay().internal.gameId + '/' + $scope.selectedTeam.uuid).
      success(function (data) {
        console.log(data);
        if (data.status === 'ok') {
          var infoClass = 'list-group-item-success';
          if (data.result.amount < 0) {
            infoClass = 'list-group-item-danger';
          }
          $scope.callLog.push({
            class: infoClass,
            title: data.result.infoText,
            message: data.result.amount,
            ts: new Date()
          });
        }
        $scope.callPanel = 2;
        $scope.showCallPanel('buy');
      }).
      error(function (data, status) {
        console.log(data);
        $scope.callPanel = 2;
        $scope.showCallPanel('buy');
      });
    }
    else {
      $scope.callPanel = 2;
      $scope.showCallPanel('buy');
    }
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
    $scope.teamInfo.callLog = [];
    $scope.teamInfo.travelLog = [];
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
    $http.post('/marketplace/buildHouses/' + dataStore.getGameplay().internal.gameId + '/' + activeCall.getCurrentTeam().uuid, {
      authToken: dataStore.getAuthToken()
    }).
    success(function (data) {
      console.log(data);
      var msg;
      if (data.result.amount === 0) {
        msg = 'Es konnten keine Häuser gebaut werden';
      }
      else {
        msg = 'Belastung: ' + data.result.amount + ', Gebaute Häuser: ';
        for (var i = 0; i < data.result.log.length; i++) {
          msg += data.result.log[i].propertyName + ' (' + data.result.log[i].buildingNb + ' / ' + data.result.log[i].amount + ') ';
        }
      }
      $scope.callLog.push({class: 'list-group-item-success', title: 'Hausbau', message: msg, ts: new Date()});
    }).
    error(function (data, status) {
      $scope.callLog.push({
        class: 'list-group-item-danger',
        title: 'Hausbau',
        message: 'Fehler: ' + status,
        ts: new Date()
      });
      console.log(data);
    });
  };
  /**
   * Buy a house for a specific property
   */
  $scope.buyHouse = function (property) {
    $http.post('/marketplace/buildHouse/' + dataStore.getGameplay().internal.gameId + '/' + activeCall.getCurrentTeam().uuid + '/' + property.uuid, {
      authToken: dataStore.getAuthToken()
    }).
    success(function (data) {
      console.log(data);
      var msg;
      if (data.result.amount === 0) {
        msg = 'Es konnten keine Häuser gebaut werden';
      }
      else {
        msg = 'Belastung: ' + data.result.amount + ', Gebaute Häuser: ';
        for (var i = 0; i < data.result.log.length; i++) {
          msg += data.result.log[i].propertyName + ' (' + data.result.log[i].buildingNb + ' / ' + data.result.log[i].amount + ') ';
        }
      }
      $scope.callLog.push({class: 'list-group-item-success', title: 'Hausbau', message: msg, ts: new Date()});
    }).
    error(function (data, status) {
      $scope.callLog.push({
        class: 'list-group-item-danger',
        title: 'Hausbau',
        message: 'Fehler: ' + status,
        ts: new Date()
      });
      console.log(data);
    })
  };
  /**
   * Gambling
   * @type {number}
   */
  $scope.gambleAmount = 0;
  $scope.gamble = function (factor) {
    if (!_.isNumber($scope.gambleAmount)) {
      return;
    }

    $http.post('/chancellery/gamble/' + dataStore.getGameplay().internal.gameId + '/' + activeCall.getCurrentTeam().uuid, {
      authToken: dataStore.getAuthToken(),
      amount: Math.abs($scope.gambleAmount) * factor
    }).
    success(function (data) {
      console.log(data);
      if (data.status === 'ok') {
        var infoClass = 'list-group-item-success';
        if (data.result.amount < 0) {
          infoClass = 'list-group-item-danger';
        }
        $scope.callLog.push({
          class: infoClass,
          title: data.result.infoText,
          message: data.result.amount,
          ts: new Date()
        });
        $scope.$apply();
      }
    }).
    error(function (data, status) {
      $scope.callLog.push({
        class: 'list-group-item-danger',
        title: 'Hausbau',
        message: 'Fehler: ' + status,
        ts: new Date()
      });
      console.log(data);
      $scope.$apply();
    })
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
    if (n < 0) {
      n = 0;
    }
    if (n > $scope.pageCount()) {
      n = $scope.pageCount() - 1;
    }
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
  /**
   * Buy a property
   * @param property
   */
  $scope.buyProperty = function (property) {
    $http.post('/marketplace/buyProperty/' + dataStore.getGameplay().internal.gameId + '/' + activeCall.getCurrentTeam().uuid + '/' + property.uuid, {
      authToken: dataStore.getAuthToken()
    }).
    success(function (data) {
      if (data.status === 'ok') {
        console.log(data);
        var res = data.result;
        var infoClass = 'list-group-item-success';
        var title = 'Kauf ' + res.property.location.name;
        var msg;
        if (res.owner) {
          // belongs another team
          infoClass = 'list-group-item-danger';
          msg = 'Das Grundstück ist bereits verkauft, Mietzins: ' + res.amount;
        }
        else if (res.amount === 0) {
          // our own
          infoClass = 'list-group-item-info';
          msg = 'Das Grundstück gehört der anrufenden Gruppe';
        }
        else {
          // we buy now
          msg = 'Grundstück gekauft. Preis: ' + res.amount;
        }
        $scope.callLog.push({class: infoClass, title: title, message: msg, ts: new Date()});
      }
    }).
    error(function (data, status) {
      console.log('ERROR');
      console.log(data);
      console.log(status);
      $scope.callLog.push({class: 'list-group-item-danger', title: 'Grundstückkauf', message: data, ts: new Date()});

    });
  };

  var newTransactionHandler = function () {
    // Just update the entries
    if ($scope.selectedTeam) {
      $scope.teamInfo.balance = dataStore.getTeamAccountBalance($scope.selectedTeam.uuid);
      $scope.teamInfo.accountEntries = dataStore.getTeamAccountEntries($scope.selectedTeam.uuid);
      $scope.setPage(9999);
      $scope.$apply();
    }
  };

  // Register the handler for Team account transaction changes
  dataStore.registerTeamAccountUpdateHandler(newTransactionHandler);

  /***********************
   * SOCKET EVENT HANDLERS
   */
  ferropolySocket.on('marketplace', function (resp) {
    switch (resp.cmd) {
      case 'buyHouses':
        console.log('Houses built');
        console.log(resp);
        break;
    }
  });

  ferropolySocket.on('propertyAccount', function (ind) {
    switch (ind.cmd) {
      case 'propertyBought':
      case 'buildingBuilt':
        if ($scope.selectedTeam && ind.property.gamedata.owner === $scope.selectedTeam.uuid) {
          // Update of our own properties needed
          $scope.teamInfo.properties = dataStore.getProperties($scope.selectedTeam.uuid);
        }
        break;
    }
  });
}

managecallCtrl.$inject = ['$scope', '$http'];
