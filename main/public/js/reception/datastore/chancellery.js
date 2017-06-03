/**
 * Chancellery part of the datastore
 * Created by kc on 11.12.15.
 */

/**
 * Updates the team account entries.
 */
DataStore.prototype.updateChancellery = function (callback) {
  var self = this;
  console.log('update chancellery');

  // see https://api.jquery.com/jquery.get/
  $.get('/chancellery/account/statement/' + this.getGameplay().internal.gameId,
    function (data) {
      self.data.chancelleryEntries = data.entries;
      if (callback) {
        callback();
      }
    })
    .fail(function (data) {
      console.log('ERROR when getting chancellery data (2):');
      console.log(data);
      self.data.chancelleryEntries = [];
      if (callback) {
        callback();
      }
    });
};
/**
 * Get the chancellery entries
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

DataStore.prototype.getChancelleryAsset = function () {
  return _.sumBy(this.data.chancelleryEntries, 'transaction.amount');
};
/**
 * Updates the pricelist (complete or the only for the user supplied)
 * @param teamId  ID of the team, undefined updates for all
 */
DataStore.prototype.updateProperties = function (teamId, callback) {
  var self = this;
  console.log('update pricelist for ' + teamId);

  // see https://api.jquery.com/jquery.get/
  $.get('/properties/get/' + this.getGameplay().internal.gameId + '/' + teamId, function (data) {
   
    for (var i = 0; i < data.properties.length; i++) {
      self.updatePropertyInPricelist(data.properties[i]);
    }

    if (callback) {
      callback();
    }
  })
    .fail(function (data) {
      console.log('ERROR when getting properties (2):');
      console.log(data);
      if (callback) {
        callback();
      }
    });

};
