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
 *
 * The data is alway held in this store, updating is triggered by the application.
 *
 * Created by kc on 14.05.15.
 */
'use strict';

var DataStore = function (initData, socket) {

  this.data = initData;
  this.socket = socket;
  this.teamAccountEntriesCallbacks = [];
  var self = this;

  this.socket.on('teamAccount', function (resp) {
    switch (resp.cmd.name) {
      case 'accountStatement':
        self.data.teamAccountEntries = resp.cmd.data;
        console.log('received ' + resp.cmd.data.length + ' accountStatement entries');
        if (self.teamAccountEntriesCallbacks.length > 0) {
          for (var i = 0; i < self.teamAccountEntriesCallbacks.length; i++) {
            self.teamAccountEntriesCallbacks[i]();
          }
          self.teamAccountEntriesCallbacks = [];
        }
        break;

      case 'onTransaction':
        self.data.teamAccountEntries.push(resp.cmd.data);
        console.log('received new team transaction');
        break;
    }
  });

  this.socket.on('chancelleryAccount', function (resp) {
    console.log('UNHANDLED: ' + resp);
  });

  this.socket.on('properties', function (resp) {
    switch (resp.cmd.name) {
      case 'getProperties':
        console.log('Pricelist updated, properties: ' + resp.cmd.data.length);
        self.data.pricelist = resp.cmd.data;
        break;
    }
  });
};

/**
 * Get all teams
 * @returns {teams|*|gameData.teams|$scope.teams|result.teams|Array}
 */
DataStore.prototype.getTeams = function () {
  return this.data.teams;
};

/**
 * Returns the gameplay
 * @returns {gameplay|*|result.gameplay|gameData.gameplay|$scope.gameplay}
 */
DataStore.prototype.getGameplay = function () {
  return this.data.gameplay;
};

/**
 * Updates the team account entries.
 * @param teamId  ID of the team, undefined updates for all
 * @param callback optional callback, called when data is available
 */
DataStore.prototype.updateTeamAccountEntries = function (teamId, callback) {
  console.log('update team account for ' + teamId);
  // So far we update all, optimize it later
  if (callback) {
    this.teamAccountEntriesCallbacks.push(callback);
  }
  this.socket.emit('teamAccount', {cmd: {name: 'getAccountStatement', team: teamId}})
};
/**
 * Get the team account entries
 *
 * @param teamId ID of the team, if undefined then all are returned
 */
DataStore.prototype.getTeamAccountEntries = function (teamId) {
  if (!teamId) {
    return this.data.teamAccountEntries;
  }
  return _.filter(this.data.teamAccountEntries, function (n) {
    return n.teamId === teamId;
  });
};
/**
 * Get the balance of the team
 * @param teamId
 */
DataStore.prototype.getTeamAccountBalance = function (teamId) {
  var entries = this.getTeamAccountEntries(teamId);
  var balance = 0;
  for (var i = 0; i < entries.length; i++) {
    balance += entries[i].transaction.amount;
  }
  return balance;
};
/**
 * Updates the property account entries. (ACCOUNT, not the Properties!)
 * @param propertyId  ID of the property, undefined updates for all
 */
DataStore.prototype.updatePropertyAccountEntries = function (propertyId) {
  console.log('update property account for ' + propertyId);
  // So far we update all, optimize it later
  this.socket.emit('propertyAccount', {cmd: {name: 'getAccountStatement', propertyId: propertyId}})
};
/**
 * Get the property account entries
 *
 * @param teamId ID of the team, if undefined then all are returned
 */
DataStore.prototype.getPropertyAccountEntries = function (teamId) {
  if (!teamId) {
    return this.data.propertyAccountEntries;
  }
  return _.filter(this.data.propertyAccountEntries, function (n) {
    return n.transaction.origin.uuid === teamId;
  });
};
/**
 * Updates the team account entries.
 */
DataStore.prototype.updateChancellery = function () {
  this.socket.emit('chancelleryAccount', {cmd: {name: 'getAccountStatement'}})
};
/**
 * Get the team account entries
 *
 * @param teamId ID of the team, if undefined then all are returned
 */
DataStore.prototype.getChancelleryEntries = function (teamId) {
  if (!teamId) {
    return this.data.chancelleryEntries;
  }
  return _.filter(this.data.chancelleryEntries, function (n) {
    return n.transaction.origin.uuid === teamId;
  });
};
/**
 * Updates the pricelist (complete or the only for the user supplied)
 * @param teamId  ID of the team, undefined updates for all
 */
DataStore.prototype.updateProperties = function (teamId) {
  console.log('update pricelist for ' + teamId);
  // So far we update all, optimize it later
  this.socket.emit('properties', {cmd: {name: 'getProperties', team: teamId}})
};
/**
 * Get the properties belonging to a team
 *
 * @param teamId ID of the team, if undefined then all are returned
 */
DataStore.prototype.getProperties = function (teamId) {
  if (!teamId) {
    return this.data.pricelist;
  }
  return _.filter(this.data.pricelist, function (n) {
    return n.gamedata.owner === teamId;
  });
};
/**
 * Run query over properties, full text
 * @param query String to query
 * @param limit max number of elements to be returned
 * @returns {Array}
 */
DataStore.prototype.searchProperties = function(query, limit) {
  console.log('Query: "' + query + '" Limit: ' + limit);
  if (!query || query.length === 0) {
    return [];
  }
  var items = _.filter(this.data.pricelist, function(p) {
    return p.location.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
  });
  return _.slice(items, 0, limit);
};

var dataStore = new DataStore(ferropoly, ferropolySocket); // ferropoly is defined in the main view
