/**
 * Settings for qnap webserver
 * Created by kc on 14.04.15.
 */
'use strict';


module.exports = function(settings) {

  settings.server = {
    port: 3004,
    host: '0.0.0.0',
    serverId: 'qnap-main'
  };

  settings.socketIoServer = {
    port: 3004,
    host: 'ferropoly.synology.me'
  };

  settings.locationDbSettings = {
    mongoDbUrl: process.env.FERROPOLY_CONNECTION_STRING
  };

  settings.cron = {
  };

  return settings;
};
