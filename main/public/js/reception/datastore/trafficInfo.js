/**
 * Traffic Info of the datastore
 * Created by kc on 11.12.15.
 */

/**
 * Get the current traffic situation
 * @param callback
 */
DataStore.prototype.updateTrafficInfo = function (callback) {
  var self = this;

  $.get('/traffic/' + this.getGameplay().internal.gameId,
    function (data) {
      // Convert times
      for (var i = 0; i < data.trafficInfo.data.item.length; i++) {
        data.trafficInfo.data.item[i].publishDate   = moment(data.trafficInfo.data.item[i].publishDate);
        data.trafficInfo.data.item[i].duration.from = moment(data.trafficInfo.data.item[i].duration.from);
        data.trafficInfo.data.item[i].duration.to   = moment(data.trafficInfo.data.item[i].duration.to);
      }
      self.data.trafficInfo = data.trafficInfo;
      if (callback) {
        callback(null, self.data.trafficInfo);
      }

    })
    .fail(function (error) {

      self.data.trafficInfo = [];
      callback(error);
    });
};

/**
 * Get the traffic info
 * @param options
 * @param callback
 */
DataStore.prototype.getTrafficInfo = function (options, callback) {
  function prepareData() {
    var retVal = self.data.trafficInfo.data.item;
    if (!options.delay) {
      retVal = _.filter(retVal, function (n) {
        return (n.reason !== 'delay');
      });
    }
    if (!options.restriction) {
      retVal = _.filter(retVal, function (n) {
        return (n.reason !== 'restriction');
      });
    }
    if (!options.construction) {
      retVal = _.filter(retVal, function (n) {
        return (n.reason !== 'construction');
      });
    }
    if (options.onlyCurrent) {
      retVal = _.filter(retVal, function (n) {
        return (moment().isAfter(n.duration.from) && moment().isBefore(n.duration.to));
      });
    }

    //_.sortBy(retVal, {''})
    if (options.limit) {
      retVal = _.slice(retVal, 0, options.limit);
    }
    callback(null, retVal);
  }

  var self = this;
  if (!self.data.trafficInfo || moment().isAfter(self.data.trafficInfo.nextUpdateTime)) {
    self.updateTrafficInfo(function () {
      prepareData();
    });
  }
  else {
    prepareData();
  }
};
