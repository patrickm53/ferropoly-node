/**
 * This is the route for component and other tests
 * Created by kc on 30.4.2021
 */
const express = require('express');
const router  = express.Router();
const path    = require('path');
/**
 * Send Component Test Homepage
 */
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'test.html'));
});

module.exports = router;
