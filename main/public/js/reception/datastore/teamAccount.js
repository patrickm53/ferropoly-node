/**
 * Datastore team account
 * Created by kc on 11.12.15.
 */

/**
 * Updates the team account entries.
 * @param teamId  ID of the team, undefined updates for all
 * @param callback optional callback, called when data is available
 */
DataStore.prototype.updateTeamAccountEntries = function (teamId, callback) {
  console.log('update team account for ' + teamId);
  var self = this;
  var i = 0;
  var query = '';
  if (teamId) {
    if (this.data.teamAccountEntries[teamId] && this.data.teamAccountEntries[teamId].length > 0) {
      // Get only the account entries we do not already have!
      query = '?start=' + _.last(this.data.teamAccountEntries[teamId]).timestamp;
    }
  }
  // see https://api.jquery.com/jquery.get/
  $.get('/teamAccount/get/' + this.getGameplay().internal.gameId + '/' + teamId + query, function (data) {
      if (data.status === 'ok') {
        console.log('/teamAccount ok, entries: ' + data.accountData.length);
        if (!teamId) {
          // All entries were retrieved, replace them completely
          self.data.teamAccountEntries = {};
          for (i = 0; i < data.accountData.length; i++) {
            var entry = data.accountData[i];
            if (!self.data.teamAccountEntries[entry.teamId]) {
              self.data.teamAccountEntries[entry.teamId] = [];
            }
            self.data.teamAccountEntries[entry.teamId].push(entry);
          }
        }
        else {
          self.data.teamAccountEntries = self.data.teamAccountEntries || {};
          self.data.teamAccountEntries[teamId] = self.data.teamAccountEntries[teamId] || [];
          // add all received entries for this team, add saldo information (as not provided when getting only the last entries)
          var balance = self.data.teamAccountEntries[teamId].length > 0 ? _.last(self.data.teamAccountEntries[teamId]).balance : 0;
          for (i = 0; i < data.accountData.length; i++) {
            var newEntry = data.accountData[i];
            balance += newEntry.transaction.amount;
            newEntry.balance = newEntry.balance || balance;
            self.data.teamAccountEntries[teamId].push(newEntry);
          }
        }
      }
      else {
        console.error('ERROR when getting accountData:');
        console.log(data);
      }
    })
    .fail(function (data) {
      console.error('ERROR when getting accountData (2):');
      console.log(data);
    })
    .always(function () {
      console.log('updateTeamAccountEntries.always()');
      for (i = 0; i < self.teamAccountUpdateHandlers.length; i++) {
        self.teamAccountUpdateHandlers[i]();
      }
      if (callback) {
        callback();
      }
    })
};
/**
 * Get the team account entries
 *
 * @param teamId ID of the team, if undefined then all are returned
 */
DataStore.prototype.getTeamAccountEntries = function (teamId) {
  console.log('getTeamAccountEntries for: ' + teamId);
  if (!this.data.teamAccountEntries) {
    this.data.teamAccountEntries = {};
  }

  if (!teamId) {
    var retVal = [];
    _.forIn(this.data.teamAccountEntries, function(value, key) {
      console.log(key);
      retVal = retVal.concat(value);
    });
    retVal = _.sortBy(retVal, 'timestamp');
    return retVal;
  }
  return  this.data.teamAccountEntries[teamId];
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
 * Adds a handler which is called when the team account of any team was updated
 * @param handler
 */
DataStore.prototype.registerTeamAccountUpdateHandler = function(handler) {
  this.teamAccountUpdateHandlers.push(handler);
};
