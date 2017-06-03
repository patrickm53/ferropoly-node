/**
 * The travel-log part of the datastore
 * Created by kc on 11.12.15.
 */

/**
 * Updates the travel log
 * @param teamId
 * @param callback
 */
DataStore.prototype.updateTravelLog = function (teamId, callback) {
  console.log('update travel log for ' + teamId);
  var self = this;
  // see https://api.jquery.com/jquery.get/
  $.get('/travellog/' + this.getGameplay().internal.gameId + '/' + teamId,
    function (data) {
      console.log('/travellog ok');
      if (!teamId) {
        // All entries were retrieved, replace them completely
        self.data.travelLog = data.travelLog;
      }
      else {
        if (!self.data.travelLog) {
          self.data.travelLog = [];
        }
        // replace all entries for this team with the received one
        _.remove(self.data.travelLog, function (e) {
          return e.teamId === teamId;
        });
        for (var i = 0; i < data.travelLog.length; i++) {
          self.data.travelLog.push(data.travelLog[i]);
        }
      }
      // Sort entries, independently how we got them
      _.sortBy(self.data.travelLog, function (e) {
        return e.timestamp;
      });

    })
    .fail(function (data) {
      console.error('ERROR when getting travelLog (2):');
      console.log(data);
    })
    .always(function () {
      console.log('travelLog.always()');
      if (callback) {
        callback();
      }
    })
};

/**
 * Gets the travel log for one team (or all, if teamId is undefined)
 * @param teamId
 */
DataStore.prototype.getTravelLog = function (teamId) {
  console.log('getTravelLog for: ' + teamId);
  if (!this.data.travelLog) {
    this.data.travelLog = [];
  }

  if (!teamId) {
    return this.data.travelLog;
  }
  return _.filter(this.data.travelLog, function (n) {
    return n.teamId === teamId;
  });
};

/**
 * Returns the trave log for a property (who was there when)
 * @param propertyId
 */
DataStore.prototype.getTravelLogForProperty = function (propertyId) {
  console.log('getTravelLogForProperty for: ' + propertyId);
  if (!this.data.travelLog) {
    this.data.travelLog = [];
  }

  var propLog = _.filter(this.data.travelLog, function (n) {
    return n.propertyId === propertyId;
  });
  return _.sortBy(propLog, 'timestamp');
};
