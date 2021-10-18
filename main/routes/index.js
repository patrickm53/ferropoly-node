/**
 * The index route
 * Created by kc on 14.04.15.
 */

const express  = require('express');
const router   = express.Router();
const path     = require('path');

/**
 * Send HTML Page
 */
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'game-selector.html'));
});



module.exports = router;

