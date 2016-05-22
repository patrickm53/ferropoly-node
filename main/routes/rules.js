/**
 * Ferropoly Rules for MAIN
 * Created by kc on 21.05.16.
 */

const express       = require('express');
const router        = express.Router();
const gameplayModel = require('../../common/models/gameplayModel');


/* GET Rules. */
router.get('/:gameId', function (req, res) {
  gameplayModel.getGameplay(req.params.gameId, null, (err, gp) => {
    if (err) {
      return res.status(400).send(err.message);
    }
    var rules = gp.toObject().rules;
    res.send(rules);
  });
});


module.exports = router;
