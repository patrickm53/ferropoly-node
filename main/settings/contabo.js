/**
 * Settings for the contabo server
 * Created by kc on 15.08.15.
 */
'use strict';


module.exports = function(settings) {

  settings.server = {
    port: 3004,
    host: '5.189.159.156',
    serverId: 'app.ferropoly.ch'
  };

  settings.socketIoServer = {
    port: 3004,
    host: '5.189.159.156'
  };

  settings.locationDbSettings = {
    mongoDbUrl: process.env.FERROPOLY_CONNECTION_STRING
  };

  settings.cron = {
    // [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
  };

  return settings;
};
