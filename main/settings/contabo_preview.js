/**
 * Settings for the contabo PREVIEW server, its IP is 5.189.159.156
 * Created by kc on 15.08.15.
 */
'use strict';

module.exports = function (settings) {

  settings.server = {
    port: 3104,
    host: 'app.ferropoly.ch',
    serverId: 'spiel.ferropoly.ch-v' + settings.version
  };

  settings.locationDbSettings = {
    mongoDbUrl: 'mongodb://localhost/ferropoly_preview'
  };

  settings.cron = {
    // [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
  };


  settings.socketIoServer = {
    port: 80, // using proxy!
    host: 'spiel-preview.ferropoly.ch'
  };

  settings.scheduler = {
    // The preview instance shall do only something if there is no other going to handle it
    delay: 0
  };

  settings.autopilot = {
    interval: 263445,
    active: true
  };

  return settings;
};
