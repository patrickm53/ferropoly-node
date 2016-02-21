/**
 * Properties on the map in the reception and checkin
 * Created by kc on 20.02.16.
 */

'use strict';


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

  // Default filter and icons
  this.setMarkerIcons(this.iconsByAccessibility);
  this.setFilter(this.filterFreeProperties);
  this.createMarkers();
}

/**
 * Remove all markers from the map
 */
PropertyMarkers.prototype.removeAll = function () {
  if (!this.enabled) {
    return;
  }
  this.markers.forEach(function (m) {
    m.setMap(null);
  });
};

/**
 * Set the filter to a function defining which markers have to be shown
 * @param filter
 */
PropertyMarkers.prototype.setFilter = function (filter) {
  this.markerFilter = filter;
};

/**
 * Set the function defining which marker icon has to be used
 * @param markerFunction
 */
PropertyMarkers.prototype.setMarkerIcons = function (markerFunction) {
  this.markerIcons = markerFunction;
};

/**
 * Update property callback for the datastore
 * @param property
 */
PropertyMarkers.prototype.updateProperty = function (property) {
  var marker               = _.find(this.markers, function (m) {
    return m.ferropolyProperty.uuid === property.uuid
  });
  marker.ferropolyProperty = property;
  this.updateMarker(marker);
};


/**
 * Show selected markers
 */
PropertyMarkers.prototype.updateMarkers = function () {
  if (!this.enabled) {
    return;
  }
  var self = this;
  this.markers.forEach(self.updateMarker.bind(self));
};


/**
 * Update a marker (icon and visibility)
 * @param marker
 */
PropertyMarkers.prototype.updateMarker = function (marker) {
  if (!marker) {
    console.warn('Marker not found', marker);
    return;
  }
  var self = this;
  if (this.markerFilter(marker.ferropolyProperty)) {
    // This one has to be shown
    if (true || !marker.getMap() === self.map) {
      marker.setMap(self.map);
    }
    marker.setIcon(self.markerIcons(marker.ferropolyProperty));
    console.log('Show marker ' + marker.ferropolyProperty.location.name);
  }
  else {
    // hide this one
    marker.setMap(null);
    console.log('Hide marker ' + marker.ferropolyProperty.location.name);
  }
};

/**
 * Create a marker (has to be done only once)
 */
PropertyMarkers.prototype.createMarkers = function () {
  if (!this.enabled) {
    return;
  }
  var self     = this;
  this.markers = [];

  this.properties.forEach(function (p) {
    var m               = new google.maps.Marker({
      position: new google.maps.LatLng(p.location.position.lat, p.location.position.lng),
      title   : p.location.name
    });
    m.ferropolyProperty = p;

    var infowindow = new google.maps.InfoWindow({
      content: '<h4>' + p.location.name + '</h4><p>Kaufpreis: ' + p.pricelist.price + '</p>'
    });
    m.addListener('click', function () {
      infowindow.open(self.map, m);
    });

    self.markers.push(m);
  });
};

/**
 * A filter displaying only free properties
 * @param p
 * @returns {boolean}
 */
PropertyMarkers.prototype.filterFreeProperties = function (p) {
  if (!p.gamedata) {
    return true;
  }
  return !p.gamedata.owner;
};

/**
 * A filter displaying the properties of a team
 * @param p
 * @returns {boolean}
 */
PropertyMarkers.prototype.filterTeamProperties = function (p) {
  if (!p.gamedata) {
    return false;
  }
  return (p.gamedata.owner === this.teamId);
};

/**
 * A filter displaying all properties
 * @param p
 * @returns {boolean}
 */
PropertyMarkers.prototype.filterAllProperties = function (p) {
  return true;
};

/**
 * Set the team Id
 * @param teamId
 */
PropertyMarkers.prototype.setTeam = function(teamId) {
  this.teamId = teamId;
};

var ICON_EDIT_LOCATION     = 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png';
var ICON_TRAIN_LOCATION    = 'https://maps.gstatic.com/mapfiles/ms2/micons/green.png';
var ICON_BUS_LOCATION      = 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow.png';
var ICON_BOAT_LOCATION     = 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png';
var ICON_CABLECAR_LOCATION = 'https://maps.gstatic.com/mapfiles/ms2/micons/purple.png';
var ICON_OTHER_LOCATION    = 'https://maps.gstatic.com/mapfiles/ms2/micons/pink.png';


/**
 * Creates markers depending on the accessibility of a location
 * @param p
 * @returns {*}
 */
PropertyMarkers.prototype.iconsByAccessibility = function (p) {
  switch (p.location.accessibility) {
    case 'train':
      return ICON_TRAIN_LOCATION;
    case 'bus':
      return ICON_BUS_LOCATION;
    case 'boat':
      return ICON_BOAT_LOCATION;
    case 'cablecar':
      return ICON_CABLECAR_LOCATION;
    default:
      return ICON_OTHER_LOCATION;
  }
};
