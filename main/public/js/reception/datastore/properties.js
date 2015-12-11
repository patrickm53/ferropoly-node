/**
 * Properties in the datastore (includes the pricelist)
 * Created by kc on 11.12.15.
 */

/**
 * Updates a received property in the pricelist
 * @param property
 */
DataStore.prototype.updatePropertyInPricelist = function (property) {
  if (property && property.uuid) {
    var i = _.findIndex(this.data.pricelist, {uuid: property.uuid});
    if (i > -1) {
      this.data.pricelist[i] = property;
    }
  }
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
    if (!n.gamedata) {
      return false;
    }
    return n.gamedata.owner === teamId;
  });
};
/**
 * Returns the free properties
 */
DataStore.prototype.getFreeProperties = function () {
  return _.filter(this.data.pricelist, function (n) {
    if (!n.gamedata) {
      return true;
    }
    return !n.gamedata.owner;
  });
};
/**
 * Run query over properties, full text
 * @param query String to query
 * @param limit max number of elements to be returned
 * @returns {Array}
 */
DataStore.prototype.searchProperties = function (query, limit) {
  console.log('Query: "' + query + '" Limit: ' + limit);
  if (!query || query.length === 0) {
    return [];
  }
  var items = _.filter(this.data.pricelist, function (p) {
    return p.location.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
  });
  return _.slice(items, 0, limit);
};

/**
 * Returns the property data by providing its id
 * @param propertyId
 * @returns {*}
 */
DataStore.prototype.getPropertyById = function (propertyId) {
  return _.find(this.data.pricelist, {uuid: propertyId});
};


/**
 * Returns the center of the map
 */
DataStore.prototype.getMapCenter = function () {
  var latSum = 0, lngSum = 0;
  for (var i = 0; i < this.data.pricelist.length; i++) {
    latSum += parseFloat(this.data.pricelist[i].location.position.lat);
    lngSum += parseFloat(this.data.pricelist[i].location.position.lng);
  }
  return {lat: latSum / this.data.pricelist.length, lng: lngSum / this.data.pricelist.length};
};
