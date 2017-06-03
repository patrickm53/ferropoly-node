/**
 * About page
 * Created by kc on 03.06.15.
 */


const express = require('express');
const router = express.Router();
const settings = require('../settings');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('about', {title: 'Ferropoly Info', versionInfo: settings.version});
});

module.exports = router;
