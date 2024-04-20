/**
 * Release candidate instance
 * Created by kc on 30.08.15.
 */


module.exports = function (settings) {

  settings.server = {
    port: 3204,
    host: 'app.ferropoly.ch',
    url: 'https://spiel-rc.ferropoly.ch',
    serverId: 'spiel.ferropoly.ch-v' + settings.version
  };

  settings.locationDbSettings = {
    mongoDbUrl: 'mongodb://localhost/ferropoly_rc',
    poolSize: 3
  };

  settings.cron = {
    // [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
  };

  //**** RELEASE SETTINGS ****
  settings.socketIoServer = {
    port: 80, // using proxy!
    host: 'spiel-rc.ferropoly.ch'
  };

  // This is the highest priorized scheduler: the contabo main rc instance
  settings.scheduler = {
    delay: 0
  };

  settings.autopilot = {
    enabled: true
  };


  // Facebook settings
  settings.oAuth.facebook.callbackURL = 'https://spiel-rc.ferropoly.ch/auth/facebook/callback';
  // Google Settings
  settings.oAuth.google.callbackURL = 'https://spiel-rc.ferropoly.ch/auth/google/callback';
  // Dropbox settings
  settings.oAuth.dropbox.callbackURL = 'https://spiel-rc.ferropoly.ch/auth/dropbox/callback';
  // Microsoft settings
  settings.oAuth.microsoft.callbackURL  = 'https://spiel-rc.ferropoly.ch/auth/microsoft/callback';


  // Logger
  settings.logger = {
    debugLevel: 'debug'
  };

  // Picture Bucket in Google Storage
  settings.picBucket.bucket = 'ferropoly-rc'
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/home/kc/ferropoly/ferropoly-service.json'

  // Logger
  settings.logger = {
    debugLevel: 'info',
    google: {
      enabled: true,
      projectId: 'crack-lamp-784',
      logName: 'main_rc',
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
    }
  };
  return settings;
};
