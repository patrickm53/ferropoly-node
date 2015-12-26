/**
 * Release candidate instance
 * Created by kc on 30.08.15.
 */
'use strict';

module.exports = function (settings) {

  settings.server = {
    port: 3204,
    host: 'app.ferropoly.ch',
    serverId: 'spiel.ferropoly.ch-v' + settings.version
  };

  settings.locationDbSettings = {
    mongoDbUrl: 'mongodb://localhost/ferropoly'
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


  // Facebook settings
  settings.oAuth.facebook.callbackURL = 'https://spiel-rc.ferropoly.ch/auth/facebook/callback';


  return settings;
};
