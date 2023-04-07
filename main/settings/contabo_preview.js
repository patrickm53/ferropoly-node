/**
 * Settings for the contabo PREVIEW server, its IP is 5.189.159.156
 * Created by kc on 15.08.15.
 */


module.exports = function (settings) {

  settings.server = {
    port: 3104,
    host: 'app.ferropoly.ch',
    url: 'https://spiel-preview.ferropoly.ch',
    serverId: 'spiel.ferropoly.ch-v' + settings.version
  };

  settings.locationDbSettings = {
    mongoDbUrl: 'mongodb://localhost/ferropoly_preview',
    poolSize: 3
  };

  settings.cron = {
    // [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
  };


  settings.socketIoServer = {
    port: 80, // using proxy!
    host: 'spiel-preview.ferropoly.ch'
  };

  settings.scheduler = {
    // The preview instance shall do only something if there is no other going to handle it
    delay: 0
  };

  settings.autopilot = {
    enabled: true
  };

  // Facebook settings
  settings.oAuth.facebook.callbackURL = 'https://spiel-preview.ferropoly.ch/auth/facebook/callback';
  // Google Settings
  settings.oAuth.google.callbackURL = 'https://spiel-preview.ferropoly.ch/auth/google/callback';
  // Dropbox settings
  settings.oAuth.dropbox.callbackURL = 'https://spiel-preview.ferropoly.ch/auth/dropbox/callback';
  // Microsoft settings
  settings.oAuth.microsoft.callbackURL  = 'https://spiel-preview.ferropoly.ch/auth/microsoft/callback';

  // Logger
  settings.logger = {
    debugLevel: 'debug'
  };

  // Picture Bucket in Google Storage
  settings.picBucket.bucket = 'ferropoly-preview'
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/home/kc/ferropoly/ferropoly-service.json'

  return settings;
};
