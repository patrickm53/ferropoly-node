/**
 * About page
 * Created by kc on 03.06.15.
 */
'use strict';

var express = require('express');
var router = express.Router();
var settings = require('../settings');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('about', {title: 'Ferropoly Info', versionInfo: settings.version});
});

module.exports = router;
