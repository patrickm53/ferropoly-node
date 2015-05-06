/**
 * Settings for local debugging
 * Created by kc on 14.04.15.
 */
'use strict';


module.exports = function(settings) {

  settings.server = {
    port: 3004,
    host: 'localhost',
    serverId: 'localhost-main'
  };

  settings.socketIoServer = {
    port: 3004,
    host: 'localhost'
  };

  settings.locationDbSettings = {
    mongoDbUrl: 'mongodb://localhost/ferropoly'
  };

  settings.cron = {
  };

  return settings;
};
