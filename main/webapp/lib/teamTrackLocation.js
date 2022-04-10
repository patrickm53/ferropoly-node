/**
 * A single location of a TeamTrack
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 23.02.22
 **/

import {get} from 'lodash';
import {DateTime} from 'luxon';

class TeamTrackLocation {
  constructor(location) {
    this.lat        = parseFloat(get(location, 'lat', '0'));
    this.lng        = parseFloat(get(location, 'lng', '0'));
    this.ts         = DateTime.fromISO(get(location, 'ts', DateTime.now().toISO()));
    this.name       = get(location, 'name', 'nada');
    this.accuracy   = location.accuracy;
    this.propertyId = location.propertyId;
    this._internals = {
      marker: null
    }
  }

  /**
   * Sets a marker on this location
   * @param map
   */
  setMarker(map) {
    if (!this._internals.marker) {
      this._internals.marker = new google.maps.Marker({
        position: {lat: this.lat, lng: this.lng},
        map     : map
      })
    } else {
      this._internals.marker.setMap(map);
    }
  }

  /**
   * Returns the position in Google compatible formatg
   * @returns {{lng: number, lat: number}}
   */
  getPosition() {
    return {lat: this.lat, lng:this.lng}
  }
}

export {TeamTrackLocation};
