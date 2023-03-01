/**
 * Things about properties
 * Created by kc on 26.05.15.
 */

const express  = require('express');
const router   = express.Router();
const propWrap = require('../lib/propertyWrapper');
const accessor = require('../lib/accessor');
const _        = require("lodash");

/**
 * Get all properties of a team
 *
 * if teamId is set to 'undefined', all are returned
 */
router.get('/get/:gameId/:teamId', function (req, res) {
  if (!req.params.gameId) {
    return res.status(400).send({message: 'No gameId supplied'});
  }
  const user = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, req.params.gameId, accessor.admin, function (err) {
    if (err) {
      // definitely not an admin and game in process. Be careful what we return, only data of the calling team is returned
     return accessor.verifyPlayer(user, req.params.gameId, req.params.teamId, err => {
       if (err) {
         return res.status(403).send({message: 'Access right error: ' + err.message});
       }
       propWrap.getTeamProperties(req.params.gameId, req.params.teamId, function (err, props) {
         if (err) {
           return res.status(500).send({message: 'getTeamProperties error: ' + err.message});
         }
         res.send({properties: props});
       });
     });
    }

    if (!req.params.teamId || req.params.teamId === 'undefined') {
      propWrap.getAllProperties(req.params.gameId, function (err, props) {
        if (err) {
          return res.status(500).send({message: 'getAllProperties error: ' + err.message});
        }
        res.send({properties: props});
      });
    }
    else {
      propWrap.getTeamProperties(req.params.gameId, req.params.teamId, function (err, props) {
        if (err) {
          return res.status(500).send({message: 'getTeamProperties error: ' + err.message});
        }
        res.send({properties: props});
      });
    }
  });
});

module.exports = router;
