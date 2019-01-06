/**
 * Settings for local debugging
 * Created by kc on 14.04.15.
 */



module.exports = function (settings) {

  settings.server = {
    port    : 3004,
    host    : '0.0.0.0',
    serverId: 'localhost-main'
  };

  settings.socketIoServer = {
    port: 3004,
    host: 'localhost'
  };

  settings.locationDbSettings = {
    mongoDbUrl: 'mongodb://localhost/ferropoly',
    poolSize  : 3
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
  settings.oAuth.google.callbackURL   = 'http://localhost:3004/auth/google/callback';
  // Dropbox settings
  settings.oAuth.dropbox.callbackURL = 'http://localhost:3004/auth/dropbox/callback';


  // Logger
  settings.logger = {
    debugLevel: 'silly'
  };

  return settings;
};
