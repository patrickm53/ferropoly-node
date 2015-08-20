/**
 * Settings for the contabo server, its IP is 5.189.159.156
 * Created by kc on 15.08.15.
 */
'use strict';


module.exports = function(settings) {

  settings.server = {
    port: process.env.FERROPOLY_MAIN_PORT,
    host: 'app.ferropoly.ch',
    serverId: 'app.ferropoly.ch-v' + settings.version
  };

  settings.socketIoServer = {
    port: process.env.FERROPOLY_MAIN_PORT,
    host: 'app.ferropoly.ch'
  };

  settings.locationDbSettings = {
    mongoDbUrl: process.env.FERROPOLY_CONNECTION_STRING
  };

  settings.cron = {
    // [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
  };

  if (process.env.FERROPOLY_PREVIEW) {
    settings.scheduler = {
      // The preview instance shall do only something if there is no other going to handle it
      delay: 60
    };
  }
  else {
    // This is the highest priorized scheduler: the contabo main instance
    settings.scheduler = {
      delay: 0
    };
  }


  return settings;
};
