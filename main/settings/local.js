/**
 * Settings for local debugging
 * Created by kc on 14.04.15.
 */
const path = require('path');

module.exports = function (settings) {

  settings.server = {
    port    : 3004,
    host    : '0.0.0.0',
    url     : 'http://localhost:3004',
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
    enabled  : true
  };


  // Facebook settings
  settings.oAuth.facebook.callbackURL = 'http://localhost:3004/auth/facebook/callback';
  // Google Settings
  settings.oAuth.google.callbackURL   = 'http://localhost:3004/auth/google/callback';
  // Dropbox settings
  settings.oAuth.dropbox.callbackURL  = 'http://localhost:3004/auth/dropbox/callback';
  // Microsoft settings
  settings.oAuth.microsoft.callbackURL  = 'http://localhost:3004/auth/microsoft/callback';

  // Picture Bucket in Google Storage
  settings.picBucket.bucket = 'ferropoly-test'
  process.env.GOOGLE_APPLICATION_CREDENTIALS =  path.join(__dirname, '..', '..', '..', 'ferropoly-service.json');

  // Logger
  settings.logger = {
    debugLevel: 'debug',
    google: {
      enabled: true,
      projectId: 'crack-lamp-784',
      logName: 'main_local',
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
    }
  };

   return settings;
};
