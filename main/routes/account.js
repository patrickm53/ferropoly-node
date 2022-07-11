/**
 * User Account Info
 * This is the same file for all ferropoly apps, but as there is a reference to the public folder, this
 * does not work in the common folder
 * Created by kc on 29.12.15.
 */
const express = require('express');
const router  = express.Router();
const path    = require('path');
/**
 * Send Account Homepage
 */
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'account.html'));
});

module.exports = router;
