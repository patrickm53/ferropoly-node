/**
 * This module receives updates from the team positions (received by geolocation) and
 * stores them into the database (but only while the game is running)
 *
 * Created by kc on 31.01.16.
 */

var ferroSocket;
var logger         = require('../../../common/lib/logger').getLogger('teams:teamPositions');
var travelLogModel = require('../../../common/models/travelLogModel');

function addLog(data) {
  travelLogModel.addPositionEntry(data.gameId, data.teamId, {
    lat     : data.position.lat,
    lng     : data.position.lng,
    accuracy: data.position.accuracy
  }, err => {
    if (err) {
      logger.error(err);
    }
  });
}

function onPlayerLocation(data) {
  switch (data.cmd) {
    case 'positionUpdate':
      addLog(data);
      break;

    default:
      logger.info('Unhandled command: ' + data.cmd)
  }
}

module.exports = {
  init: function () {
    ferroSocket = require('../ferroSocket').get();
    ferroSocket.on('player-position', onPlayerLocation);
  }
};
