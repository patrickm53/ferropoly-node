/**
 * Reception route
 * Created by kc on 10.05.15.
 */
const express          = require('express');
const router           = express.Router();
const errorHandler     = require('../lib/errorHandler');
const gameCache        = require('../lib/gameCache');
const path             = require('path');

/**
 * Send HTML Page
 */
router.get('/:gameId', function (req, res) {
  gameCache.getGameData(req.params.gameId, (err, gameData) => {
    if (err || !gameData) {
      return errorHandler(res, 'Spiel nicht gefunden.', err, 404);
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'reception.html'));
  });
});


module.exports = router;
