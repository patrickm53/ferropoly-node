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
const logger    = require('../../common/lib/logger').getLogger('picBucketRoute');

/**
 * Route announcing a picture: intendion to upload, but pic is not uploaded yet
 */
router.post('/announce/:gameId/:teamId', (req, res) => {
  const gameId           = req.params.gameId;
  const teamId           = req.params.teamId;
  const propertyId       = req.body.propertyId;
  const message          = req.body.message;
  const position         = req.body.position;
  const lastModifiedDate = req.body.lastModifiedDate;
  const user             = _.get(req.session, 'passport.user', 'nobody');

  if (!req.body.authToken) {
    return res.status(401).send({message: 'Permission denied (1)'});
  }
  if (req.body.authToken !== req.session.authToken) {
    logger.info(`Authtoken mismatch for ${user}: ${req.body.authToken} vs ${req.session.authToken}`, req.session);
    return res.status(401).send({message: 'Permission denied (2)'});
  }

  accessor.verifyPlayer(user, gameId, teamId, err => {
    if (err) {
      return res.status(401).send({message: 'Diese Aktion ist nicht erlaubt'});
    }
    picBucket.announceUpload(gameId, teamId, {propertyId, message, user, position, lastModifiedDate}, (err, info) => {
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
  const position = req.body.position;

  picBucket.confirmUpload(req.params.id, {position}, (err, doc) => {
    if (err) {
      return res.status(500).send({message: err.message});
    }
    res.send(doc);
  })
});

/**
 * Returns ALL images for a game, for admins only
 */
router.get('/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const user   = _.get(req.session, 'passport.user', 'nobody');
  accessor.verify(user, gameId, accessor.admin, err => {
    if (err) {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    }
    picBucket.list(gameId, {}, (err, list) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      res.send(list);
    })
  })
});


/**
 * Returns the images of a team
 */
router.get('/:gameId/:teamId', (req, res) => {
  const gameId = req.params.gameId;
  const teamId = req.params.teamId;
  const user   = _.get(req.session, 'passport.user', 'nobody');
  accessor.verifyPlayer(user, gameId, teamId, err => {
    if (err) {
      return res.status(403).send({message: 'Access right error: ' + err.message});
    }
    picBucket.list(gameId, {teamId}, (err, list) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      res.send(list);
    })
  })
});


module.exports = router;
