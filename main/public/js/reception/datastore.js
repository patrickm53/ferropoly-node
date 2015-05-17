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
  var self = this;

  this.socket.on('teamAccount', function (resp) {
    switch (resp.cmd.name) {
      case 'accountStatement':
        self.data.teamAccountEntries = resp.cmd.data;
        console.log('received ' + resp.cmd.data.length + ' accountStatement entries');
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
    console.log('UNHANDLED: ' + resp);
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
 * Updates the team account entries.
 * @param teamId  ID of the team, undefined updates for all
 */
DataStore.prototype.updateTeamAccountEntries = function (teamId) {
  console.log('update team account for ' + teamId);
  // So far we update all, optimize it later
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
 * Updates the property account entries. (ACCOUNT, not the Properties!)
 * @param teamId  ID of the team, undefined updates for all
 */
DataStore.prototype.updatePropertyAccountEntries = function (teamId) {
  console.log('update team account for ' + teamId);
  // So far we update all, optimize it later
  this.socket.emit('propertyAccount', {cmd: {name: 'getAccountStatement', team: teamId}})
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
  return _.filter(this.data.teamAccountEntries, function (n) {
    return  n.transaction.origin.uuid === teamId;
  });
};
/**
 * Updates the team account entries.
 */
DataStore.prototype.updateChancellery = function () {
  this.socket.emit('chancelleryAccount', {cmd: {name: 'getAccountStatement', team: teamId}})
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
  return _.filter(this.data.teamAccountEntries, function (n) {
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

var dataStore = new DataStore(ferropoly, ferropolySocket); // ferropoly is defined in the main view
