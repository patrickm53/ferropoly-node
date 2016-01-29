/**
 * Geolocation for the Ferropoly checkin
 * Created by kc on 29.01.16.
 */

'use strict';
function Geograph() {
  this.position = null;
  this.clients = [];
}

Geograph.prototype.localize = function() {
  var self = this;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      self.position = pos;
      for (var i = 0; i < self.clients.length; i++) {
        self.clients[i](pos);
      }
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};

Geograph.prototype.getLastLocation = function() {
  return this.position;
};

Geograph.prototype.onLocationChanged = function(client) {
  this.clients.push(client);
};

var geograph = new Geograph();
