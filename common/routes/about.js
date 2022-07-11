/**
 * The about route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.04.22
 **/

const express = require('express');
const router  = express.Router();
const _       = require('lodash');
const path    = require('path');
let settings  = {};

/**
 * Get the about page
 */
router.get('/', function (req, res) {
  let appPath = _.get(settings, 'appPath', 'none');
  res.sendFile(path.join(__dirname, '..', '..', appPath, 'public', 'html', 'about.html'));
});

/**
 * The exports: an init function only
 * @type {{init: Function}}
 */
module.exports = {
  init: function (app, _settings) {

    settings = _settings;

    // The login page
    app.use('/about', router);
    settings = _settings;
  }
};
