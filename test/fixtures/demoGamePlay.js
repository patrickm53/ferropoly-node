/**
 *
 * Created by kc on 25.04.15.
 */
'use strict';


// Working path is ferropoly-main, path relative from here
var createDemoGamePath = '../ferropoly-editor/bin/createDemoGame.js';

module.exports = {
  createDemo: function (options, callback) {
    var spawn = require('child_process').spawn,
      demo = spawn(createDemoGamePath);

    demo.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    demo.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    demo.on('close', function (code) {
      console.log('child process exited with code ' + code);
      var gameParams = {
        gameId: 'local-demo-game'
      };
      callback(null, gameParams);
    });
  }
};
