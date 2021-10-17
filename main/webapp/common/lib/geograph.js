/**
 * Geolocation for Ferropoly
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 24.07.21
 **/

import {DateTime} from 'luxon';
import EventEmitter from './eventEmitter';

class Geograph extends EventEmitter {
  constructor() {
    super();
    this.position            = null;
    this.nextUpdateNotBefore = DateTime.now();
  }

  localize() {
    let self = this;
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        function (pos) {
          // Handler when everything is ok
          self.position = pos;
          if (self.nextUpdateNotBefore < DateTime.now()) {
            self.emit('player-position', {
              cmd     : 'positionUpdate',
              position: {lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy}
            });
            self.nextUpdateNotBefore = DateTime.now().plus({seconds: 60});
          } else {
            console.log('Sending position suppressed');
          }
        },
        function (err) {
          // Handler in case of an error
          self.emit('player-position', {cmd: 'positionError', err: err.code});
          switch (err.code) {
            case err.PERMISSION_DENIED:
              console.error('User denied the request for Geolocation.');
              break;
            case err.POSITION_UNAVAILABLE:
              console.error('Location information is unavailable.');
              break;
            case err.TIMEOUT:
              console.error('The request to get user location timed out.');
              break;
            case err.UNKNOWN_ERROR:
              console.error('An unknown error occurred.');
              break;
          }
        });
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }

  getLastLocation() {
    if (this.position === null) {
      this.localize();
    }
    return this.position;
  }

}


const geograph = new Geograph();

export default geograph;
