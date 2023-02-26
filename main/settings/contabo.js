/**
 * Settings for the contabo server, its IP is 5.189.159.156
 * Created by kc on 15.08.15.
 */


module.exports = function (settings) {

  settings.server = {
    port: 3004,
    host: 'app.ferropoly.ch',
    url: 'https://spiel.ferropoly.ch',
    serverId: 'spiel.ferropoly.ch-v' + settings.version
  };

  settings.locationDbSettings = {
    mongoDbUrl: 'mongodb://localhost/ferropoly',
    poolSize: 10
  };

  settings.cron = {
    // [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
  };

  //**** RELEASE SETTINGS ****
  settings.socketIoServer = {
    port: 80, // using proxy!
    host: 'spiel.ferropoly.ch'
  };

  // This is the highest priorized scheduler: the contabo main instance
  settings.scheduler = {
    delay: 0
  };

  // Facebook settings
  settings.oAuth.facebook.callbackURL = 'https://spiel.ferropoly.ch/auth/facebook/callback';
  // Google Settings
  settings.oAuth.google.callbackURL = 'https://spiel.ferropoly.ch/auth/google/callback';
  // Dropbox settings
  settings.oAuth.dropbox.callbackURL = 'https://spiel.ferropoly.ch/auth/dropbox/callback';
  // Microsoft settings
  settings.oAuth.microsoft.callbackURL  = 'https://spiel.ferropoly.ch/auth/microsoft/callback';

  // Logger
  settings.logger = {
    debugLevel: 'info'
  };

  // Picture Bucket in Google Storage
  settings.picBucket = {
    bucket: 'ferropoly'
  }

  return settings;
};
