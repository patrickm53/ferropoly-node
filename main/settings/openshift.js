/**
 * Settings for the openshift server
 * Created by kc on 14.04.15.
 */



module.exports = function(settings) {

  settings.server = {
    port: process.env.OPENSHIFT_NODEJS_PORT,
    host: process.env.OPENSHIFT_NODEJS_IP,
    serverId: 'openshift-main'
  };

  settings.socketIoServer = {
    port: 8000,
    host: 'spiel-ferropoly.rhcloud.com'
  };

  settings.locationDbSettings = {
    mongoDbUrl: process.env.FERROPOLY_CONNECTION_STRING
  };

  settings.cron = {
    // [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
    // The openshift server is in EST (east coast USA)

  };

  // This is the third highest priorized scheduler right after the qnap main instance
  settings.scheduler = {
    delay: 20
  };

  return settings;
};
