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
    }
  });
  /**
   * Get the team account entries
   *
   * @param teamId ID of the team, if undefined then all are returned
   */
  this.getTeamAccountEntries = function (teamId) {
    if (!teamId) {
      return this.data.teamAccountEntries;
    }
    return _.filter(this.data.teamAccountEntries, function (n) {
      return n.teamId === teamId;
    });
  };

  this.getTeams = function() {
    return this.data.teams;
  };
};

var dataStore = new DataStore(ferropoly, ferropolySocket); // ferropoly is defined in the main view

console.log('socket state: ' + ferropolySocket.connected);
