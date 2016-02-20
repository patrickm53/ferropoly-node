/**
 * Properties on the map in the reception and checkin
 * Created by kc on 20.02.16.
 */

'use strict';

var ICON_EDIT_LOCATION     = 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png';
var ICON_TRAIN_LOCATION    = 'https://maps.gstatic.com/mapfiles/ms2/micons/green.png';
var ICON_BUS_LOCATION      = 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow.png';
var ICON_BOAT_LOCATION     = 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png';
var ICON_CABLECAR_LOCATION = 'https://maps.gstatic.com/mapfiles/ms2/micons/purple.png';
var ICON_OTHER_LOCATION    = 'https://maps.gstatic.com/mapfiles/ms2/micons/pink.png';

/**
 * Constructor
 * @param map
 * @param properties
 * @constructor
 */
function PropertyMarkers(map, properties) {
  this.map        = map;
  this.properties = properties;
  this.markers    = [];

  if (_.isUndefined(google)) {
    console.warn('Google Maps are not defined, PropertyMarkers are not enabled');
    this.enabled = false;
    return;
  }

  this.enabled = true;


}

PropertyMarkers.prototype.removeAll = function () {
  if (!this.enabled) {
    return;
  }
  this.markers.forEach(function (m) {
    m.setMap(null);
  });
};

PropertyMarkers.prototype.createMarkers = function (properties) {
  if (!this.enabled) {
    return;
  }
  var self     = this;
  this.markers = [];

  properties.forEach(function (p) {
    var m               = new google.maps.Marker({
      position: new google.maps.LatLng(p.location.position.lat, p.location.position.lng),
      title   : p.location.name
    });
    m.ferropolyProperty = p;
    self.markers.push(m);
  });
};

/**
 * Show selected markers
 * @param filter is a function which applies on the property
 * @param properties are only supplied if there is an update needed
 */
PropertyMarkers.prototype.showMarkers = function (filter, properties) {
  if (!this.enabled) {
    return;
  }
  var self = this;

  // default is all filters on
  filter = filter || function () {
      return true
    };

  if (properties) {
    this.removeAll();
    this.createMarkers(properties);
  }

  var markers = _.filter(this.markers, function (m) {
    return filter(m.ferropolyProperty);
  });

  markers.forEach(function (m) {
    m.setMap(self.map);
  });

};
