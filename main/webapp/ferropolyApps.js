const path = require('path');

/**
 * This module configures all Ferropoly Webapps for the Webpack configuration
 */
module.exports = [
  {
    name    : 'login',
    entry   : path.join(__dirname, 'login', 'app.js'),
    htmlFile: 'login.html'
  },
  {
    name    : 'game-selector',
    entry   : path.join(__dirname, 'game-selector', 'app.js'),
    htmlFile: 'game-selector.html'
  }
];
