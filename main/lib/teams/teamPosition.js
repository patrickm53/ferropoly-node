/**
 * This module receives updates from the team positions (received by geolocation) and
 * stores them into the database (but only while the game is running)
 *
 * Created by kc on 31.01.16.
 */

var ferroSocket;
var logger         = require('../../../common/lib/logger').getLogger('teams:teamPositions');
var travelLogModel = require('../../../common/models/travelLogModel');
var gameCache      = require('../gameCache');

function addLog(data) {
  gameCache.getGameData(data.gameId, (err, gc) => {
    if (err) {
      return logger.error(err);
    }

    /**
     * Privacy: we log the position of the teams only during the game, not when they access
     * the web page before or afterwards. But there is a certain tolerance given, log also
     * a little before and after the game (could be helpful if one team is missing on the
     * way to the game respectively when coming home after the game)
     */
    var start = moment(gc.gameplay.scheduling.gameStartTs).subtract(2, 'hours');
    var end   = moment(gc.gameplay.scheduling.gameEndTs).add(60, 'minutes');
    if (moment().isAfter(end) || moment().isBefore(start)) {
      return;
    }

    travelLogModel.addPositionEntry(data.gameId, data.teamId, {
      lat     : data.position.lat,
      lng     : data.position.lng,
      accuracy: data.position.accuracy
    }, err => {
      if (err) {
        logger.error(err);
      }
    });
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
