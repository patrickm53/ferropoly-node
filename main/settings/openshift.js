/**
 * Settings for the openshift server
 * Created by kc on 14.04.15.
 */
'use strict';


module.exports = function(settings) {

  settings.server = {
    port: process.env.OPENSHIFT_NODEJS_PORT,
    host: process.env.OPENSHIFT_NODEJS_IP
  };

  settings.socketIoServer = {
    port: 80,
    host: 'main-ferropoly.rhcloud.com'
  };

  settings.locationDbSettings = {
    mongoDbUrl: process.env.FERROPOLY_CONNECTION_STRING
  };

  settings.cron = {
    // [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
    // The openshift server is in EST (east coast USA)

  };

  return settings;
};
