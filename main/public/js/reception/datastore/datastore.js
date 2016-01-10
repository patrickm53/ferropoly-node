/**
 * Datastore for the ferropoly reception client
 *
 * lodash is required
 *
 * this.data contains:
 * - teams:                  static, do not change during the game
 * - gameplay:               static, all info about the current GP
 * - pricelist:              changing, all properties of the pricelist
 * - teamAccountEntries:     changing, all entries of all team accounts
 * - chancelleryEntries:     changing, data of the chancellery
 * - propertyAccountEntries: changing, all entries of the propertiesAccount
 * - events:                 changing, events of a team (local data only)
 * - authToken:              static, the authorisation token for the api
 * - rankingList:            changing, the ranking list of the game
 * - incomeList:             changing (stats), income of all teams
 * - travelLog:              changing, the log where the team was
 * - trafficInfo:            changing, information about the traffic situation
 *
 * The data is always held in this store, updating is triggered by the application.
 *
 * Created by kc on 14.05.15.
 */
'use strict';

var DataStore = function (initData, socket) {

  this.data = initData;
  this.data.events = {};
  this.socket = socket;
  this.teamAccountUpdateHandlers = [];

  var self = this;

  this.teamColors = [
    'blue', 'brown', 'darkgreen', 'gold', 'red', 'olive', 'peru', 'cyan', 'indianred', 'khaki',
    'greenyellow', 'plum', 'skyblue', 'navy', 'darkred', 'lightsalmon', 'lime', 'fuchsia', 'indigo', 'chocolate'
  ];

  // Incoming team account messages
  this.socket.on('admin-teamAccount', function (resp) {
    console.log('onTeamAccount: ' + resp.cmd);
    switch (resp.cmd) {
      case 'onTransaction':
        if (!self.data.teamAccountEntries) {
          self.data.teamAccountEntries = {};
        }
        // we do not know whether we have really all entries or missed some indications: get all newer entries
        // since the last known one.
        self.updateTeamAccountEntries(resp.data.teamId);
        break;
      default:
        console.log('UNHANDLED: ' + resp.cmd);
        break;
    }
  });

  // Incoming Property Account Messages
  this.socket.on('admin-propertyAccount', function (ind) {
    switch (ind.cmd) {
      case 'propertyBought':
      case 'buildingBuilt':
        var i = _.findIndex(self.data.pricelist, {uuid: ind.property.uuid});
        self.data.pricelist[i] = ind.property;
        console.log('Property account, updated: ' + i + '(' + ind.cmd + ')');
        break;

      default:
        console.log('UNHANDLED: ' + ind.cmd);
        break;
    }

  });

  // Incoming Chancellery Messages
  this.socket.on('admin-chancelleryAccount', function (resp) {
    console.log('UNHANDLED: ' + resp);
  });

  // Incoming Properties messages
  this.socket.on('admin-properties', function (resp) {
    console.log('onProperties');
    console.log(resp);
    switch (resp.cmd) {
      case 'getProperties':
        console.log('Pricelist updated, properties: ' + resp.data.length);
        self.data.pricelist = resp.data;
        break;
    }
  });

  // Incoming marketplace messages
  this.socket.on('admin-marketplace', function (info) {
    console.log('onMarketplace: ' + info.cmd);
    console.log(info);
    switch (info.cmd) {
      case 'buyProperty':
        if (info.result.property) {
          self.updatePropertyInPricelist(info.result.property);
        }
        break;
    }
  });
};


/**
 * Returns the gameplay
 * @returns {gameplay|*|result.gameplay|gameData.gameplay|$scope.gameplay}
 */
DataStore.prototype.getGameplay = function () {
  return this.data.gameplay;
};

/**
 * Checks whether a game is active or not
 * @returns {boolean}
 */
DataStore.prototype.isGameActive = function () {
  var start = moment(this.data.gameplay.scheduling.gameStartTs);
  var end = moment(this.data.gameplay.scheduling.gameEndTs);
  if (moment().isAfter(end)) {
    console.log('Game over');
    return false;
  }
  if (moment().isBefore(start)) {
    console.log('Game not started yet');
    return false;
  }
  return true;
};

/**
 * Pushes an event for a given team onto the event stack
 * @param teamId
 * @param eventText
 */
DataStore.prototype.pushEvent = function (teamId, eventText) {
  if (!this.data.events[teamId]) {
    this.data.events[teamId] = [];
  }
  this.data.events[teamId].push({ts: new Date(), message: eventText});
};

/**
 * Get the events for a given team
 * @param teamId
 * @returns {*}
 */
DataStore.prototype.getEvents = function (teamId) {
  if (!this.data.events[teamId]) {
    this.data.events[teamId] = [];
  }
  return this.data.events[teamId];
};

/**
 * Returns the authToken needed for POST requests
 * @returns {authToken|*|ferropoly.authToken|.session.authToken}
 */
DataStore.prototype.getAuthToken = function () {
  return this.data.authToken;
};

