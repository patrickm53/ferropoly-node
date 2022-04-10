/**
 * A track for one single Ferropoly team which is displayed on the map
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.02.22
 **/
import {get, sortBy, find, last, maxBy, minBy} from 'lodash';
import {faLocationDot} from '@fortawesome/free-solid-svg-icons';
import {TeamTrackLocation} from './teamTrackLocation';

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
    this.circle                = null;
    this.ICON_CURRENT_LOCATION = '/images/markers/red-dot.png';
  }

  /**
   * Override color
   * @param color
   */
  setTrackColor(color) {
    this.color = color;
  }

  /**
   * Pushes a new location to the track
   * @param location
   */
  pushLocation(location) {
    let newLocation = new TeamTrackLocation(location);
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
   * Returns the array with the track points
   * @returns {[]}
   */
  getTrackPoints() {
    return this.track;
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

  /**
   * Draws the circle with the accuracy (if applicable)
   */
  drawAccuracyCircle() {
    if (this.circle) {
      this.circle.setMap(null);
    }
    if (this.track.length === 0) {
      return;
    }
    let lastElement = last(this.track);

    this.circle = new google.maps.Circle({
      strokeWeight: 0,
      fillColor   : this.color,
      fillOpacity : 0.2,
      map         : this.map,
      center      : {lat: lastElement.lat, lng: lastElement.lng},
      radius      : get(lastElement, 'accuracy', 400)
    })
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
      if (this.marker) {
        this.marker.setMap(null);
      }
      return;
    }
    if (!this.marker) {
      // well, this is pretty cool: using FontAwesome as icon for the marker.
      // see https://developers.google.com/maps/documentation/javascript/examples/marker-modern
      // for details!
      this.marker = new google.maps.Marker({
        position: {
          lat: lastPosition.lat,
          lng: lastPosition.lng
        },
        map     : null,
        icon    : {
          path        : faLocationDot.icon[4],
          fillColor   : this.color,
          fillOpacity : 1,
          anchor      : new google.maps.Point(
            faLocationDot.icon[0] / 2, // width
            faLocationDot.icon[1] // height
          ),
          strokeWeight: 1,
          strokeColor : '#ffffff',
          scale       : 0.05,
        },
      });

      // Open an info Window if someone clicks on it
      if (this.name && this.name.length > 0) {
        this.infoWindow = new google.maps.InfoWindow({
          content: `<h4>${this.name}</h4>`
        })
        this.marker.addListener('click', () => {
          this.infoWindow.open(this.map, this.marker);
        });
      }

    } else {
      this.marker.setPosition({lat: lastPosition.lat, lng: lastPosition.lng});
    }
    this.marker.setMap(this.map);
  }

  /**
   * Updates the polyline
   */
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
   * Returns the bounds of the travel log
   */
  getBounds() {
    let retVal = {
      north: maxBy(this.track, p => {
        return p.lat;
      }).lat,
      south: minBy(this.track, p => {
        return p.lat;
      }).lat,
      east : maxBy(this.track, p => {
        return p.lng;
      }).lng,
      west : minBy(this.track, p => {
        return p.lng;
      }).lng,
    }
    console.log('track bounds', retVal);
    return retVal;
  }

  /**
   * Returns the latest known location
   * @returns {TeamTrackLocation|unknown}
   */
  getLatestLocation() {
    if (this.track.length === 0) {
      return new TeamTrackLocation({lat: 47.36970, lng: 8.53897, accuracy: 10000, name: 'Vielleicht am Paradeplatz?'});
    }
    return last(this.track);
  }

  /**
   * Sets the map: if map is a google map, the track is shown, if null, the track is hidden
   * @param map
   */
  setMap(map) {
    this.map = map;
    this.drawAccuracyCircle();
    this.updateMarker();
    this.updatePolyline();
  }
}

export default TeamTrack;
