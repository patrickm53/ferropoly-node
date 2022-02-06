/**
 * A track for one single Ferropoly team which is displayed on the map
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.02.22
 **/
import {get, sortBy, find, last} from 'lodash';
import {DateTime} from 'luxon';

class TeamTrack {
  /**
   * Constructor
   * @param options
   */
  constructor(options) {
    this.id                    = get(options, 'id', 'none');
    this.color                 = get(options, 'color', 'red');
    this.name                  = get(options, 'name', '');
    this.track                 = [];
    this.map                   = null; // The Google Map instance the track is assigned to
    this.marker                = null; // Marker displaying the current position
    this.polyline              = null;
    this.ICON_CURRENT_LOCATION = '/images/markers/red-dot.png';
  }

  /**
   * Pushes a new location to the track
   * @param location
   */
  pushLocation(location) {
    let newLocation = {
      lat: parseFloat(get(location, 'lat', 0)),
      lng: parseFloat(get(location, 'lng', 0)),
      ts : DateTime.fromISO(get(location, 'ts', DateTime.now().toISO())),
    }
    if (!find(this.track, {'ts': newLocation.ts})) {
      this.track.push(newLocation);
      // Sort by timestamp
      sortBy(this.track, e => {
        return e.ts;
      })
    }

    // Update if map is active
    if (this.map) {
      this.updateMarker();
      this.updatePolyline();
    }
  }

  /**
   * Clear the complete track
   */
  clear() {
    this.track = [];
    this.updateMarker();
    this.updatePolyline();
  }

  /**
   * Returns true if the track is visible
   * @returns {boolean}
   */
  isVisible() {
    console.log('is visible', (this.map !== null))
    return (this.map !== null);
  }

  /***
   * Creates / updates the position marker to the latest known position
   */
  updateMarker() {
    if (typeof google === 'undefined') {
      return;
    }
    const lastPosition = last(this.track);
    if (!lastPosition) {
      console.log('no last position, quit');
      this.marker.setMap(null);
      return;
    }
    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: {
          lat: lastPosition.lat,
          lng: lastPosition.lng
        },
        map     : null,
        title   : this.name,
      });
      this.marker.setIcon(this.ICON_CURRENT_LOCATION);
    } else {
      this.marker.setPosition({lat: lastPosition.lat, lng: lastPosition.lng});
    }
    this.marker.setMap(this.map);
  }

  updatePolyline() {
    if (typeof google === 'undefined') {
      return;
    }
    let lineOptions = {
      path         : this.track,
      geodesic     : true,
      strokeColor  : this.color,
      strokeOpacity: 1.0,
      strokeWeight : 4,
      map          : this.map
    }
    if (!this.polyline) {
      this.polyline = new google.maps.Polyline(lineOptions);
    } else {
      this.polyline.setPath(this.track);
    }
    this.polyline.setMap(this.map);
    this.polyline.setVisible(this.map !== null);
  }

  /**
   * Sets the map: if map is a google map, the track is shown, if null, the track is hidden
   * @param map
   */
  setMap(map) {
    this.map = map;

    this.updateMarker();
    this.updatePolyline();

  }
}

export default TeamTrack;
