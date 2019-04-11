/**
 * Geolocation for the Ferropoly checkin
 * Created by kc on 29.01.16.
 */

import moment from 'moment'
import ferropolySocket from './socket'

class Geograph {
  constructor() {
    this.position            = null;
    this.clients             = [];
    this.nextUpdateNotBefore = moment();
  }


  localize() {
    let self = this;
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        function (pos) {
          // Handler when everything is ok
          self.position = pos;
          for (let i = 0; i < self.clients.length; i++) {
            self.clients[i](pos);
          }
          if (self.nextUpdateNotBefore.isBefore(moment())) {
            ferropolySocket.emit('player-position', {
              cmd     : 'positionUpdate',
              position: {lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy}
            });
            self.nextUpdateNotBefore = moment().add(20, 's'); // will be (5, 'm')
          }
          else {
            console.log('Sending position suppressed');
          }

        },
        function (err) {
          // Handler in case of an error
          ferropolySocket.emit('player-position', {cmd: 'positionError', err: err.code});
          switch (err.code) {
            case err.PERMISSION_DENIED:
              console.error("User denied the request for Geolocation.");
              break;
            case err.POSITION_UNAVAILABLE:
              console.error("Location information is unavailable.");
              break;
            case err.TIMEOUT:
              console.error("The request to get user location timed out.");
              break;
            case err.UNKNOWN_ERROR:
              console.error("An unknown error occurred.");
              break;
          }
        });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  getLastLocation() {
    return this.position;
  }

  onLocationChanged(client) {
    this.clients.push(client);
  }
}


const geograph = new Geograph();

export default geograph
