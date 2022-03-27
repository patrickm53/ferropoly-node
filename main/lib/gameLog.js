/**
 * This is the log of a game, what happened? Who was when were?
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 27.03.22
 **/

const _            = require('lodash');
const gameLogModel = require('../../common/models/gameLogModel');
const logger       = require('../../common/lib/logger').getLogger('gameLog');

let ferroSocket = null;


module.exports = {
  initSocket: function (socket) {
    ferroSocket = socket;
  },

  addEntry: function (gameMessage, callback) {

    gameLogModel.addEntry(gameMessage, (err, entry) => {
      if (err) {
        logger.error(err);
      }
      if (ferroSocket) {
        let message = {
          title    : entry.title,
          saveTitle: entry.saveTitle,
          message  : entry.message,
          category : entry.category,
          timestamp: entry.timestamp,
          id       : entry._id
        }
        ferroSocket.emitToGame(_.get(gameMessage, 'gameId', 'none'), 'general', message);
      }
      if (callback) {
        return callback(err);
      }
    })
  },

  CAT_GENERAL    : gameLogModel.CAT_GENERAL,
  CAT_CHANCELLERY: gameLogModel.CAT_CHANCELLERY,
  CAT_PROPERTY   : gameLogModel.CAT_PROPERTY
}
