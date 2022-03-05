const path = require('path');

/**
 * This module configures all Ferropoly Webapps for the Webpack configuration
 */
module.exports = [
  {
    name    : 'login',
    entry   : path.join(__dirname, 'login', 'app.js'),
    htmlFile: 'login.html'
  }, {
    name    : 'test',
    entry   : path.join(__dirname, 'test', 'app.js'),
    htmlFile: 'test.html'
  },
  {
    name    : 'game-selector',
    entry   : path.join(__dirname, 'game-selector', 'app.js'),
    htmlFile: 'game-selector.html'
  },
  {
    name    : 'game-info',
    entry   : path.join(__dirname, 'game-info', 'app.js'),
    htmlFile: 'game-info.html'
  },
  {
    name    : 'join',
    entry   : path.join(__dirname, 'join', 'app.js'),
    htmlFile: 'join.html'
  },
  {
    name    : 'account',
    entry   : path.join(__dirname, 'account', 'app.js'),
    htmlFile: 'account.html'
  },
  {
    name    : 'team',
    entry   : path.join(__dirname, 'team', 'app.js'),
    htmlFile: 'team.html'
  },
  {
    name    : 'reception',
    entry   : path.join(__dirname, 'reception', 'app.js'),
    htmlFile: 'reception.html'
  },
  {
    name    : 'summary',
    entry   : path.join(__dirname, 'summary', 'app.js'),
    htmlFile: 'summary.html'
  },
];
