/**
 * The index route
 * Created by kc on 14.04.15.
 */
'use strict';

var express = require('express');
var router = express.Router();

var settings = require('../settings');
var ngFile = '/js/indexctrl.js';
if (settings.minifedjs) {
  ngFile = '/js/indexctrl.min.js'
}

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', {title: 'Ferropoly', ngController: 'indexCtrl', ngApp: 'indexApp', ngFile: ngFile});
});

module.exports = router;
