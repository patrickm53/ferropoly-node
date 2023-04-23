/**
 * Route for serving images
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 22.01.23
 **/

const fs      = require('fs');
const path    = require('path');
const express = require('express');
const router  = express.Router();
const cors    = require('cors');

const corsOptions = {
  origin              : 'https://ferropoly.ch',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/**
 * Returns a random integer
 * @param min
 * @param max
 * @return {number}
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

/**
 * Sends one of the images in a directory (random)
 * @param dir
 * @param res
 */
function sendRandomImage(dir, res) {
  fs.readdir(path.join(__dirname, 'ressources', dir), (err, files) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    let file = files[getRandomInt(0, files.length)];
    res.set('Content-Type', 'image/jpeg');
    res.sendFile(path.join(__dirname, 'ressources', dir, file));
  });
}

/**
 * Gets a random background image
 */
router.get('/background.jpg', cors(corsOptions), function (req, res) {
  sendRandomImage('backgrounds', res);
});

/**
 * Gets a random header image
 */
router.get('/header.jpg', cors(corsOptions), function (req, res) {
  sendRandomImage('headers', res);
});

module.exports = router;
