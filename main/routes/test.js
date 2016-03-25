/**
 * A temporary test route
 *
 * Created by kc on 10.05.15.
 */


var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('test', {title: 'Ferropoly', ngController: 'indexCtrl', ngApp: 'indexApp', ngFile: 'r'});
});

module.exports = router;
