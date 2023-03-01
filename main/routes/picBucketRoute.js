/**
 * Pic Bucket Route: about uploading images (and getting them again)
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 01.03.23
 **/

const express   = require('express');
const router    = express.Router();
const accessor  = require('../lib/accessor');
const _         = require('lodash');
const picBucket = require('../lib/picBucket')(require('../settings').picBucket);
router.post('/announce/:gameId/:teamId', (req, res) => {
  if (!req.body.authToken) {
    return res.status(401).send({message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.authToken) {
    return res.status(401).send({message: 'Permission denied (2)'});
  }

  const gameId     = req.params.gameId;
  const teamId     = req.params.teamId;
  const propertyId = req.body.propertyId;
  const message    = req.body.message;
  const user       = _.get(req.session, 'passport.user', 'nobody');

  accessor.verifyPlayer(user, gameId, teamId, err => {
    if (err) {
      return res.status(401).send({message: 'Diese Aktion ist nicht erlaubt'});
    }
    picBucket.announceUpload(gameId, teamId, {propertyId, message}, (err, info) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      res.send(info);
    })
  })
});

/**
 * Confirms an upload
 */
router.post('/confirm/:id', (req, res) => {
  // No need for auth checks, the id is too specific for abuse, don't waste time
  picBucket.confirmUpload(req.params.id, (err, doc) => {
    if (err) {
      return res.status(500).send({message: err.message});
    }
    res.send(doc);
  })
});
module.exports = router;
