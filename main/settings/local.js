/**
 * Settings for local debugging
 * Created by kc on 14.04.15.
 */



module.exports = function (settings) {

  settings.server = {
    port    : process.env.FERROPOLY_MAIN_PORT,
    host    : '0.0.0.0',
    serverId: 'localhost-main'
  };

  settings.socketIoServer = {
    port: process.env.FERROPOLY_MAIN_PORT,
    host: 'localhost'
  };

  settings.locationDbSettings = {
    mongoDbUrl: process.env.FERROPOLY_CONNECTION_STRING,
    poolSize: 3
  };

  settings.cron = {};

  settings.scheduler = {
    delay: 5
  };

  settings.autopilot = {
    interval: 60000,
    gameId  : 'local-demo-game',
    active  : true
  };

  settings.traffic = {
    simulation: true
  };

  // Facebook settings
  settings.oAuth.facebook.callbackURL = 'http://localhost:3004/auth/facebook/callback';
  // Google Settings
  settings.oAuth.google.callbackURL = 'http://localhost:3004/auth/google/callback';


  return settings;
};
