/**
 * Datastore for the ferropoly reception client
 *
 * lodash is required
 *
 * Created by kc on 14.05.15.
 */
'use strict';

var DataStore = function (initData, socket) {

  this.data = initData;
  this.socket = socket;
  var self = this;

  this.socket.on('teamAccount', function(resp) {
    switch(resp.cmd.name) {
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

};

/**
 * Get all teams
 * @returns {teams|*|gameData.teams|$scope.teams|result.teams|Array}
 */
DataStore.prototype.getTeams = function() {
  return this.data.teams;
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

var dataStore = new DataStore(ferropoly, ferropolySocket); // ferropoly is defined in the main view
