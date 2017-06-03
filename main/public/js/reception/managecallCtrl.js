/**
 * Controller for the manage call page
 * Created by kc on 16.05.15.
 */
'use strict';

ferropolyApp.controller('managecallCtrl', managecallCtrl);
function managecallCtrl($scope, $http) {

  // Pagination
  $scope.itemsPerPage            = 6;
  $scope.currentPage             = 0;
  // Property Query
  $scope.propertyQuery           = '';
  $scope.propertyQueryResult     = [];
  // General
  $scope.teams                   = dataStore.getTeams();
  $scope.callPanel               = 0;
  $scope.preselectedTeam         = undefined;
  $scope.selectedTeam            = activeCall.getCurrentTeam();
  $scope.teamInfo                = {
    numberOfProperties: 0,
    balance           : 0,
    accountEntries    : [],
    properties        : [],
    callLog           : []
  };
  $scope.propertyInvestCandidate = undefined;

  $scope.isGameActive = function () {
    return dataStore.isGameActive();
  };

  /**
   * Local function for pushing an event
   * @param text
   */
  function pushEvent(text) {
    dataStore.pushEvent(activeCall.getCurrentTeam().uuid, text);
  }

  $scope.getTeamColor    = function (teamId) {
    return dataStore.getTeamColor(teamId);
  };
  $scope.getPropertyName = function (log) {
    if (log.propertyId) {
      return dataStore.getPropertyById(log.propertyId).location.name;
    }
    else return log.position.lat + ' / ' + log.position.lng
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

    if (panel === 'log') {
      refreshMapPanel();
    }
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
      $scope.teamInfo.balance        = dataStore.getTeamAccountBalance(team.uuid);
      $scope.teamInfo.accountEntries = dataStore.getTeamAccountEntries(team.uuid);
      $scope.setPage(5000); // last page
      $scope.$apply();
    });
  };
  $scope.refreshProperties  = function (team) {
    if (!team) {
      team = $scope.selectedTeam;
    }
    dataStore.updateProperties(team.uuid, function () {
      $scope.teamInfo.properties = dataStore.getProperties(team.uuid);
      console.log('Properties', $scope.teamInfo.properties);
      dataStore.updateTravelLog(team.uuid, function () {
        $scope.teamInfo.travelLog = dataStore.getTravelLog(team.uuid);
        redrawMap();
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
    $scope.callLog         = [];
    $scope.gambleAmount    = 0;
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
    $scope.selectedTeam    = $scope.preselectedTeam;
    $scope.preselectedTeam = undefined;

    if (playChancellery) {
      // Play chancellery in every standard call
      $http.get('/chancellery/play/' + dataStore.getGameplay().internal.gameId + '/' + $scope.selectedTeam.uuid).success(function (data) {
        console.log(data);

        var infoClass = 'list-group-item-success';
        if (data.result.amount < 0) {
          infoClass = 'list-group-item-danger';
        }
        $scope.callLog.push({
          class  : infoClass,
          title  : data.result.infoText,
          message: data.result.amount.toLocaleString('de-CH'),
          ts     : new Date()
        });

        $scope.callPanel = 2;
        $scope.showCallPanel('buy');
      }).error(function (data, status) {
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
    $scope.callPanel                   = 0;
    // Reset info, avoid that another call displays the data during fetching it
    $scope.teamInfo.numberOfProperties = 0;
    $scope.teamInfo.balance            = 0;
    $scope.teamInfo.accountEntries     = [];
    $scope.teamInfo.callLog            = [];
    $scope.teamInfo.travelLog          = [];
    $scope.currentPage                 = 0;
    $scope.propertyQuery               = '';
    $scope.propertyQueryResult         = [];
    $scope.selectedTeam                = undefined;
    $scope.preselectedTeam             = undefined;
    activeCall.finish();
  };

  /**
   * Buy houses for all properties of this team
   */
  $scope.buyHouses = function () {
    $http.post('/marketplace/buildHouses/' + dataStore.getGameplay().internal.gameId + '/' + activeCall.getCurrentTeam().uuid, {
      authToken: dataStore.getAuthToken()
    }).success(function (data) {
      console.log(data);
      var msg;
      if (data.result.amount === 0) {
        msg = 'Es konnten keine Häuser gebaut werden';
      }
      else {
        msg = 'Belastung: ' + data.result.amount.toLocaleString('de-CH') + ', Gebaute Häuser: ';
        for (var i = 0; i < data.result.log.length; i++) {
          msg += data.result.log[i].propertyName + ' (' + data.result.log[i].buildingNb + ' / ' + data.result.log[i].amount.toLocaleString('de-CH') + ') ';
        }
      }
      $scope.callLog.push({class: 'list-group-item-success', title: 'Hausbau', message: msg, ts: new Date()});
    }).error(function (data, status) {
      $scope.callLog.push({
        class  : 'list-group-item-danger',
        title  : 'Hausbau',
        message: 'Fehler: ' + status,
        ts     : new Date()
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
    }).success(function (data) {
      console.log(data);
      property = dataStore.getPropertyById(property.uuid);
      var msg;
      if (data.result.amount === 0) {
        msg = 'In ' + property.location.name + ' konnte nicht gebaut werden';
      }
      else {
        msg = 'Belastung für Hausbau in ' + property.location.name + ': ' + data.result.amount.toLocaleString('de-CH');
      }
      $scope.callLog.push({
        class  : 'list-group-item-success',
        title  : 'Hausbau einzelnes Grundstück',
        message: msg,
        ts     : new Date()
      });
    }).error(function (data, status) {
      $scope.callLog.push({
        class  : 'list-group-item-danger',
        title  : 'Hausbau',
        message: 'Fehler: ' + status,
        ts     : new Date()
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
      amount   : Math.abs($scope.gambleAmount) * factor
    }).success(function (data) {
      console.log(data);
      var infoClass = 'list-group-item-success';
      if (data.result.amount < 0) {
        infoClass = 'list-group-item-danger';
      }
      $scope.callLog.push({
        class  : infoClass,
        title  : data.result.infoText,
        message: data.result.amount.toLocaleString('de-CH'),
        ts     : new Date()
      });
    }).error(function (data, status) {
      $scope.callLog.push({
        class  : 'list-group-item-danger',
        title  : 'Gambling',
        message: 'Fehler: ' + status,
        ts     : new Date()
      });
      console.log(data);
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
  $scope.pageCount        = function () {
    return Math.ceil($scope.teamInfo.accountEntries.length / $scope.itemsPerPage);
  };
  $scope.nextPage         = function () {
    if ($scope.currentPage < $scope.pageCount()) {
      $scope.currentPage++;
    }
  };
  $scope.nextPageDisabled = function () {
    return $scope.currentPage === ($scope.pageCount() - 1) ? "disabled" : "";
  };
  $scope.setPage          = function (n) {
    if (n < 0) {
      n = 0;
    }
    if (n > $scope.pageCount()) {
      n = $scope.pageCount() - 1;
    }
    $scope.currentPage = n;
  };
  $scope.range            = function () {
    var rangeSize = 8;
    var ret       = [];
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

    if (property.isBeingBought) {
      // This avoids duplicate buy entries for people clicking twice, GitHub issue #59
      console.log('Already buying property, cancel request');
      return;
    }
    property.isBeingBought = true;

    $http.post('/marketplace/buyProperty/' + dataStore.getGameplay().internal.gameId + '/' + activeCall.getCurrentTeam().uuid + '/' + property.uuid, {
      authToken: dataStore.getAuthToken()
    }).success(function (data) {
      property.isBeingBought = false; // Request is over, reset flag

      console.log(data);
      var res       = data.result;
      var infoClass = 'list-group-item-success';
      var title     = 'Kauf ' + res.property.location.name;
      var msg;
      if (res.owner) {
        // belongs another team
        infoClass = 'list-group-item-danger';
        msg       = 'Das Grundstück ist bereits verkauft, Mietzins: ' + res.amount.toLocaleString('de-CH');
      }
      else if (res.amount === 0) {
        // our own
        infoClass = 'list-group-item-info';
        msg       = 'Das Grundstück gehört der anrufenden Gruppe';
      }
      else {
        // we buy now
        msg = 'Grundstück gekauft. Preis: ' + res.amount.toLocaleString('de-CH');
      }
      $scope.callLog.push({class: infoClass, title: title, message: msg, ts: new Date()});

      // Update Travel Log Log
      dataStore.updateTravelLog(activeCall.getCurrentTeam().uuid, function () {
        $scope.teamInfo.travelLog = dataStore.getTravelLog(activeCall.getCurrentTeam().uuid);
        redrawMap();
      });

    }).error(function (data, status) {
      property.isBeingBought = false; // Request is over, reset flag
      console.log('ERROR in buyProperty/', data, status);
      $scope.callLog.push({class: 'list-group-item-danger', title: 'Grundstückkauf', message: data, ts: new Date()});
    });
  };

  var newTransactionHandler = function () {
    // Just update the entries
    if ($scope.selectedTeam) {
      $scope.teamInfo.balance        = dataStore.getTeamAccountBalance($scope.selectedTeam.uuid);
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

  ferropolySocket.on('admin-propertyAccount', function (ind) {
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


  /**************************
   * MAP HANDLERS (TRAVEL LOG
   */

  $scope.mapFilter = 'free';

  /**
   * Is api loaded or not?
   * @returns {*}
   */
  $scope.mapApiLoaded = function () {
    return (google && google.maps);
  };

  $scope.filterChanged = function () {
    switch ($scope.mapFilter) {
      case 'free':
        $scope.propertyMarkers.setFilter($scope.propertyMarkers.filterFreeProperties);
        break;

      case 'teamAccount':
        $scope.propertyMarkers.setTeam(activeCall.getCurrentTeam().uuid);
        $scope.propertyMarkers.setFilter($scope.propertyMarkers.filterTeamProperties);
        break;

      case 'all':
        $scope.propertyMarkers.setFilter($scope.propertyMarkers.filterAllProperties);
        break;
    }
    $scope.propertyMarkers.updateMarkers();
  };

  /**
   * Initialize the map
   */
  function initializeMap() {

    // Create a map object, and include the MapTypeId to add
    // to the map type control.
    var mapOptions = {
      zoom  : 10,
      center: new google.maps.LatLng(47.29725, 8.867215),

      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP]
      }
    };

    console.log(document.getElementById('map_canvas'));
    $scope.map = new google.maps.Map(document.getElementById('map-log'),
      mapOptions);

    $scope.propertyMarkers = new PropertyMarkers($scope.map, dataStore.getProperties());
    dataStore.onPropertiesUpdated(function (p) {
      $scope.propertyMarkers.updateProperty(p);
    });
  }

  /**
   * Redrawing the map
   */
  function redrawMap() {
    if (!$scope.mapApiLoaded()) {
      return;
    }
    // Force the update
    google.maps.event.trigger($scope.map, 'resize');

    var center;
    if ($scope.teamInfo.travelLog.length > 0) {
      center = _.last($scope.teamInfo.travelLog).position;
    }
    else {
      center = dataStore.getMapCenter();
    }
    $scope.map.setCenter(new google.maps.LatLng(center.lat, center.lng));
    // Draw the line with the travel route and set the current marker
    drawTravelLog();
    setCurrentMarker();
    $scope.propertyMarkers.updateMarkers();
    $scope.propertyMarkers.closeAllInfoWindows();
  }

  /**
   * Refresh map panel when activating it (otherwise the map doesn't show up)
   */
  function refreshMapPanel() {
    _.delay(redrawMap, 250);
  }

  /**
   * Draw a line
   * @param line
   * @param color
   * @returns {google.maps.Polyline}
   */
  function drawTeamTravelLine(line, color) {
    var lineOptions = {
      path         : line,
      geodesic     : true,
      strokeColor  : color,
      strokeOpacity: 1.0,
      strokeWeight : 2,
      map          : $scope.map
    };
    return new google.maps.Polyline(lineOptions);
  }

  /**
   * Draws the travel log of the team
   */
  function drawTravelLog() {
    if (!$scope.mapApiLoaded()) {
      return;
    }

    var line = [];
    var log  = $scope.teamInfo.travelLog;

    for (var t = 0; t < log.length; t++) {
      if (log[t].position) {
        line.push(new google.maps.LatLng(log[t].position.lat, log[t].position.lng));
      }
    }

    var lineOptions = {
      path         : line,
      geodesic     : true,
      strokeColor  : 'red',
      strokeOpacity: 1.0,
      strokeWeight : 2,
      map          : $scope.map
    };
    if ($scope.teamTravelPolyline) {
      $scope.teamTravelPolyline.setMap(null);
    }
    $scope.teamTravelPolyline = new google.maps.Polyline(lineOptions);
  }

  /**
   * Set the current marker of the team
   */
  function setCurrentMarker() {
    if (!$scope.mapApiLoaded() || $scope.teamInfo.travelLog.length === 0) {
      return;
    }

    if ($scope.teamCurrentPositionMarker) {
      $scope.teamCurrentPositionMarker.setMap(null);
    }

    $scope.teamCurrentPositionMarker = new google.maps.Marker({
      position: _.last($scope.teamInfo.travelLog).position,
      map     : $scope.map
    });
  }

  /**
   * Set the focus to the the position selected in the log
   * @param logEntry
   */
  $scope.focusLogPosition = function (logEntry) {
    if (!$scope.mapApiLoaded()) {
      return;
    }
    $scope.map.setCenter(logEntry.position);

    if ($scope.teamLogMarker) {
      $scope.teamLogMarker.setMap(null);
    }
    if ($scope.teamLogAccuracyCircle) {
      $scope.teamLogAccuracyCircle.setMap(null);
    }

    $scope.teamLogMarker = new google.maps.Marker({
      position: logEntry.position,
      map     : $scope.map
    });

    $scope.teamLogAccuracyCircle = new google.maps.Circle({
      strokeColor  : '#0000FF',
      strokeOpacity: 0.8,
      strokeWeight : 2,
      fillColor    : '#0000FF',
      fillOpacity  : 0.35,
      map          : $scope.map,
      center       : logEntry.position,
      radius       : logEntry.position.accuracy
    });
  };


  // Init the map when the document is ready
  $(document).ready(initializeMap);
}

managecallCtrl.$inject = ['$scope', '$http'];
