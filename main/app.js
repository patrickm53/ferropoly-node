/**
 * Ferropoly Main
 *
 * This is the "real" application file
 * Created by kc on 14.04.15.
 */

const express      = require('express');
const path         = require('path');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const passport     = require('passport');
const flash        = require('connect-flash');
const session      = require('express-session');
const compression  = require('compression');
const MongoStore   = require('connect-mongo')(session);
const moment       = require('moment');
const settings     = require('./settings');
const uuid         = require('uuid');

// Model includes
const users        = require('../common/models/userModel');
const properties   = require('../common/models/propertyModel');
const ferropolyDb  = require('../common/lib/ferropolyDb');
const logs         = require('../common/models/logModel');
const teamPosition = require('./lib/teams/teamPosition');

// Routes includes
const login        = require('./routes/login');
const joinRoute    = require('./routes/join');
const authtoken    = require('./routes/authtoken');
const ferroSocket  = require('./lib/ferroSocket');
const autopilot    = require('./lib/autopilot');
const logger       = require('../common/lib/logger').getLogger('main:app');
const authStrategy = require('../common/lib/authStrategy')(settings, users);


require('../common/lib/mailer').init(settings);

logger.info('Ferropoly Copyright (C) 2015 Christian Kuster, CH-8342 Wernetshausen');
logger.info('This program comes with ABSOLUTELY NO WARRANTY;');
logger.info('This is free software, and you are welcome to redistribute it');
logger.info('under certain conditions; see www.ferropoly.ch for details.');

const app = express();

/**
 * Initialize DB connection, has to be only once for all models
 */
ferropolyDb.init(settings, function (err, db) {
  if (err) {
    logger.warning('Failed to init ferropolyDb');
    logger.error(err);
    return;
  }

  logs.init(settings);

  var server = require('http').Server(app);

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  morgan.token('prefix', function getId() {
    return 'http: ' + moment().format();
  });
  app.use(morgan(':prefix :method :status :remote-addr :url'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(cookieParser());

  // Using compression speeds up the connection (and uses much less data for mobile)
  app.use(compression());

  // Non authenticated pages
  app.use('/info', require('./routes/info'));
  app.use('/summary', require('./routes/summary'));
  app.use('/rules', require('./routes/rules'));

  // Define Strategy, login
  passport.use(authStrategy.facebookStrategy);
  passport.use(authStrategy.googleStrategy);
  passport.use(authStrategy.dropboxStrategy);
  passport.use(authStrategy.localStrategy);
  // Session serializing of the user
  passport.serializeUser(authStrategy.serializeUser);
  // Session deserialisation of the user
  passport.deserializeUser(authStrategy.deserializeUser);
  // required for passport: configuration
  app.use(session({
    secret           : 'ferropolyIsAGameWithAVeryLargePlayground',
    resave           : true,
    saveUninitialized: false,
    cookie           : {
      secure: 'auto'
    },
    genid            : function () {
      return 'S_' + moment().format('YYMMDD-HHmmss-') + uuid.v4();
    },
    store            : new MongoStore({mongooseConnection: db, ttl: 2 * 24 * 60 * 60}),
    name             : 'ferropoly-spiel'
  }));
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session
  app.use(express.static(path.join(__dirname, 'public')));

  // Set auth route
  require('../common/routes/auth')(app);

  // Routes initialisation
  app.use('/appinfo', require('../common/routes/info'));
  login.init(app, settings);
  app.use('/', require('./routes/index'));
  app.use('/test', require('./routes/test'));
  app.use('/reception', require('./routes/reception'));
  app.use('/marketplace', require('./routes/marketplace'));
  app.use('/statistics', require('./routes/statistics'));
  app.use('/properties', require('./routes/properties'));
  app.use('/download', require('./routes/download'));
  app.use('/about', require('./routes/about'));
  app.use('/gamecache/', require('./routes/gamecache'));
  app.use('/teamAccount', require('./routes/teamAccount'));
  app.use('/propertyAccount', require('./routes/propertyAccount'));
  app.use('/chancellery', require('./routes/chancellery'));
  app.use('/travellog', require('./routes/travellog'));
  app.use('/traffic', require('./routes/traffic'));
  app.use('/userinfo', require('./routes/userinfo'));
  app.use('/account', require('./routes/account'));
  app.use('/checkin', require('./routes/checkin'));
  app.use('/gameplays', require('./routes/gameplays'));
  app.use('/team', require('./routes/team'));
  app.use('/agb', require('../common/routes/agb'));
  app.use('/join', joinRoute);
  app.use('/anmelden', joinRoute);
  authtoken.init(app);

  app.set('port', settings.server.port);
  app.set('ip', settings.server.host);
  ferroSocket.create(server);

  // Now it is time to start the scheduler (after initializing ferroSocket, is required by marketplace)
  const gameScheduler = require('./lib/gameScheduler');
  const marketplace   = require('./lib/accounting/marketplace').createMarketplace(gameScheduler);
  gameScheduler.update(err => {
    if (err) {
      logger.info('Error while updating scheduler');
    }
  });

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    logger.debug('Page not found', req.url);
    const err = new Error('Not Found');
    res.status(401);

    res.render('error/404', {
      message: 'Nicht gefunden',
      url    : req.url,
      error  : {status: 404}
    });
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error  : err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error  : {}
    });
  });

  server.listen(settings.server.port, settings.server.host, () => {
    logger.info('%s: Node server started on %s:%d ...',
      new Date(Date.now()), app.get('ip'), app.get('port'));

    teamPosition.init();
    autopilot.init(settings);

    logger.info('Ferropoly Main server listening on port ' + app.get('port'));
  });
});
