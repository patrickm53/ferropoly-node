/**
 * Settings for qnap webserver
 * Created by kc on 14.04.15.
 */



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

  // This is the second highest priorized scheduler right after the contabo main instance
  settings.scheduler = {
    delay: 10
  };


  settings.autopilot = {
    interval: 289432,
    active: true
  };

  return settings;
};
