/**
 * Geolocation for Ferropoly
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 24.07.21
 **/


import EventEmitter from './eventEmitter';
import {get} from 'lodash';


class Geograph extends EventEmitter {
  /**
   * Constructor
   */
  constructor() {
    super();
    this.position = null;
  }

  /**
   * One time localization
   * @returns {null}
   */
  localize() {
    let self          = this;
    /**
     * Sets the position, updates the clients
     * @param geoLocationPosition
     */
    const setPosition = function (geoLocationPosition) {
      if (!geoLocationPosition) {
        self.position = null;
        self.emit('player-position-error');
      } else {
        //console.log('GPS: receiving new geolocation position', geoLocationPosition);
        self.position = {
          lat     : get(geoLocationPosition, 'coords.latitude', 0),
          lng     : get(geoLocationPosition, 'coords.longitude', 0),
          accuracy: get(geoLocationPosition, 'coords.accuracy', 1000)
        };
        self.emit('player-position-update', self.position);
      }
    }

    if (navigator.geolocation) {
      // navigator object is in browser available when there's a GPS
      navigator.geolocation.getCurrentPosition(
        pos => {
          // Handler when everything is ok
          setPosition(pos, true);
        },
        err => {
          // Handler in case of an error
          switch (err.code) {
            case err.PERMISSION_DENIED:
              console.error('GPS: User denied the request for Geolocation.');
              setPosition(null);
              break;
            case err.POSITION_UNAVAILABLE:
              console.warn('GPS: Location information is unavailable.');
              break;
            case err.TIMEOUT:
              console.warn('GPS: The request to get user location timed out.');
              break;
            case err.UNKNOWN_ERROR:
              console.error('GPS: An unknown error occurred.');
              break;
          }
        });
    } else {
      console.log('GPS: Geolocation is not supported by this browser.');
      setPosition(null);
      self.emit('player-position-error');
    }
    return this.position;
  }

  /**
   * Returns whether the current position is valid or no
   * @returns {boolean}
   */
  positionIsValid() {
    return this.position !== null;
  }

  /**
   * Returns the last position
   * @returns {null}
   */
  getLastLocation() {
    if (this.position === null) {
      this.localize(true);
    }
    return this.position;
  }

  /**
   * starts the periodic scan, no intention to stop it any time
   * @param interval
   */
  startPeriodicScan(interval) {
    let self = this;
    setInterval(() => {
      self.localize();
    }, 15000);
  }

}

const geograph = new Geograph();

export default geograph;
