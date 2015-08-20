/**
 * Settings for local debugging
 * Created by kc on 14.04.15.
 */
'use strict';


module.exports = function(settings) {

  settings.server = {
    port: process.env.FERROPOLY_MAIN_PORT,
    host: '0.0.0.0',
    serverId: 'localhost-main'
  };

  settings.socketIoServer = {
    port: process.env.FERROPOLY_MAIN_PORT,
    host: 'localhost'
  };

  settings.locationDbSettings = {
    mongoDbUrl: process.env.FERROPOLY_CONNECTION_STRING
  };

  settings.cron = {
  };

  settings.scheduler = {
    delay: 5
  };

  settings.autopilot = {
    interval: 2000,
    active: false
  };

  return settings;
};
