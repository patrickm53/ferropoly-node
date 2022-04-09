/**
 * This module receives updates from the team positions (received by geolocation) and
 * stores them into the database (but only while the game is running)
 *
 * Created by kc on 31.01.16.
 */

let ferroSocket;
const logger         = require('../../../common/lib/logger').getLogger('teams:teamPositions');
const travelLogModel = require('../../../common/models/travelLogModel');
const gameCache      = require('../gameCache');
const moment         = require('moment');

function addLog(data) {
  gameCache.getGameData(data.gameId, (err, gc) => {
    if (err) {
      return logger.error(err);
    }

    logger.debug('Player position', data);

    /**
     * Privacy: we log the position of the teams only during the game, not when they access
     * the web page before or afterwards. But there is a certain tolerance given, log also
     * a little before and after the game (could be helpful if one team is missing on the
     * way to the game respectively when coming home after the game)
     */
    let start = moment(gc.gameplay.scheduling.gameStartTs).subtract(2, 'hours');
    let end   = moment(gc.gameplay.scheduling.gameEndTs).add(60, 'minutes');
    if (moment().isAfter(end) || moment().isBefore(start)) {
      return;
    }

    travelLogModel.addPositionEntry(data.gameId, data.teamId, data.user, {
      lat     : data.position.lat,
      lng     : data.position.lng,
      accuracy: data.position.accuracy
    }, (err, entry) => {
      if (err) {
        return logger.error(err);
      }
      // Same style as returned by the team log
      ferroSocket.emitToAdmins(data.gameId, 'player-position', entry);
    });
  });

}

/**
 * Event for the player location
 * @param data
 */
function onPlayerLocation(data) {

  switch (data.cmd) {
    case 'positionUpdate':
      addLog(data);
      break;

    default:
      logger.info('Unhandled command: ' + data.cmd);
  }
}

module.exports = {
  init: function () {
    ferroSocket = require('../ferroSocket').get();
    ferroSocket.on('player-position', onPlayerLocation);
  }
};
