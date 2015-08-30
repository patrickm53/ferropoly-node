/**
 * Release candidate instance
 * Created by kc on 30.08.15.
 */
'use strict';

module.exports = function (settings) {

  settings.server = {
    port: process.env.FERROPOLY_MAIN_PORT,
    host: 'app.ferropoly.ch',
    serverId: 'app.ferropoly.ch-v' + settings.version
  };

  settings.locationDbSettings = {
    mongoDbUrl: process.env.FERROPOLY_CONNECTION_STRING
  };

  settings.cron = {
    // [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
  };

  //**** RELEASE SETTINGS ****
  settings.socketIoServer = {
    port: 80, // using proxy!
    host: 'spiel-rc.ferropoly.ch'
  };

  // This is the highest priorized scheduler: the contabo main rc instance
  settings.scheduler = {
    delay: 0
  };

  settings.autopilot = {
    interval: 263445,
    active: true
  };


  return settings;
};
