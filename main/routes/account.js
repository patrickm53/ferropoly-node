/**
 * User Account information
 * Created by kc on 30.12.15.
 */

var express = require('express');
var router  = express.Router();

var ngFile = '/js/accountCtrl.js';

router.get('/', function (req, res) {
  res.render('account', {
    title       : 'Mein Account',
    hideLogout  : false
  });
});


module.exports = router;
