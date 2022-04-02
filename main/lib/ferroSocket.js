/**
 * The socket.io connection to the client. All data is received here, all data sent to the client is
 * sent by this module.
 * Created by kc on 10.05.15.
 */

const EventEmitter     = require('events').EventEmitter;
const authTokenManager = require('./authTokenManager');
const logger           = require('../../common/lib/logger').getLogger('ferroSocket');
const settings         = require('../settings');
const _                = require('lodash');
const util             = require('util');
const accessor         = require('./accessor');
const {v4: uuid}       = require('uuid');
const gameLogModel     = require('../../common/models/gameLogModel');
const moment           = require('moment');

let ferroSocket;

/**
 * Constructor of the FerroSocket
 * @param server
 * @constructor
 */
function FerroSocket(server) {
  EventEmitter.call(this);
  let self = this;
  this.io  = require('socket.io')(server);

  this.sockets = {};

  this.io.on('connect', function () {
    logger.info('io connect event');
  });
  this.io.on('connection', function (socket) {
    logger.info('io connection event');
    socket.emit('welcome', {
      name   : settings.name,
      appName: settings.appName,
      version: settings.version,
      debug  : settings.debug,
      preview: settings.preview
    });
  });
  this.io.on('connect_error', function (obj) {
    logger.info('io connect_error event');
    logger.info(obj);
  });
  this.io.on('connect_timeout', function () {
    logger.info('io connect_timeout event');
  });
  this.io.on('reconnect', function () {
    logger.info('io reconnect event');
  });
  this.io.on('reconnect_attempt', function () {
    logger.info('io reconnect_attempt event');
  });
  this.io.on('reconnecting', function () {
    logger.info('io reconnecting event');
  });
  this.io.on('reconnect_error', function () {
    logger.info('io reconnect_error event');
  });
  this.io.on('reconnect_failed', function () {
    logger.info('io reconnect_failed event');
  });
  /**
   * New client connects, verifiy its identity and if suceeded, add to the trusted
   * sockets (otherwise disconnect)
   */
  this.io.on('connection', function (socket) {
    socket.on('identify', function (data) {
      authTokenManager.verifyToken(data.user, data.authToken, function (err) {
        if (err) {
          logger.info('Invalid socket');
          socket.disconnect();
          return;
        }

        // Check the access rights
        accessor.verify(data.user, data.gameId, accessor.admin, function (err) {
          if (err) {
            // Admin verification failed, is it a player?
            accessor.verifyPlayer(data.user, data.gameId, data.teamId, function (err) {
              if (err) {
                logger.info('No access rights, invalid socket');
                socket.disconnect();
                return;
              }
              socket.ferropoly = {
                isAdmin : false,
                isPlayer: true,
                teamId  : data.teamId,
                user    : data.user
              };
              logger.info('Verified PLAYER socket added for ' + data.gameId + ' : ' + socket.id);
              self.addSocket(socket, data.user, data.gameId);
              self.registerChannels(socket);
              self.emit('player-connected', {gameId: data.gameId, teamId: data.teamId, user: data.user});
              self.emitGameMessagesAfterConnect(data.gameId, socket);
            });
            return;
          }

          // Admin verification ok
          socket.ferropoly = {
            isAdmin : true,
            isPlayer: true // get player info too
          };
          logger.info('Verified ADMIN socket added for ' + data.gameId + ' : ' + socket.id);
          self.addSocket(socket, data.user, data.gameId);
          self.emit('admin-connected', {gameId: data.gameId, user: data.user});
          self.registerChannels(socket);
          self.emitGameMessagesAfterConnect(data.gameId, socket);
        });
      });
    });
    socket.emit('identify', {});

    socket.on('disconnect', function () {
      logger.info('disconnected socket ' + socket.id);
      self.removeSocket(socket);
    });
  });
}

util.inherits(FerroSocket, EventEmitter);
/**
 * Add a socket after connection
 * @param socket
 * @param userId
 * @param gameId
 */
FerroSocket.prototype.addSocket = function (socket, userId, gameId) {
  if (!this.sockets[gameId]) {
    this.sockets[gameId] = [];
  }
  if (!_.includes(this.sockets[gameId], socket)) {
    socket.ferropoly        = socket.ferropoly || {};
    socket.ferropoly.gameId = gameId;
    socket.ferropoly.userId = userId;

    this.sockets[gameId].push(socket);
    logger.info('Socketmanager: new socket added ' + socket.id);
  }
};

/**
 * Remove a socket after disconnection
 * @param socket
 */
FerroSocket.prototype.removeSocket = function (socket) {
  _.forIn(this.sockets, function (value) {
    if (_.isArray(value)) {
      _.remove(value, function (s) {
        return s === socket;
      });
    }
  });
};

/**
 * Registers the listener channels for a socket
 * @param socket
 */
FerroSocket.prototype.registerChannels = function (socket) {
  let self = this;

  function registerChannel(channelName) {
    socket.on(channelName, function (data) {
      logger.info(channelName + ' request received:' + data.cmd);
      data.gameId   = socket.ferropoly.gameId;
      data.teamId   = socket.ferropoly.teamId; // not defined for admins
      data.user     = socket.ferropoly.user; // not defined for admins
      data.response = function (channel, resp) {
        self.emitToClients(socket.gameId, channel, resp);
      };
      self.emit(channelName, data);
    });
  }

  // These channels are for admins only
  if (socket.ferropoly.isAdmin) {
    registerChannel('admin-propertyAccount');
    registerChannel('admin-chancelleryAccount');
    registerChannel('admin-properties');
    registerChannel('admin-marketplace');
  }

  if (socket.ferropoly.isPlayer) {
    registerChannel('player-position');
  }
  // Say the socket that we are operative
  socket.emit('initialized', {result: true, isAdmin: socket.ferropoly.isAdmin, isPlayer: socket.ferropoly.isPlayer});
};


/**
 * Emit data to all clients belonging to a given gameId
 * @param gameId
 * @param channel
 * @param data
 */
FerroSocket.prototype.emitToClients = function (gameId, channel, data) {
  logger.error(new Error('emitToClients is obsolete, refactor using the specific emitters'));
  logger.info('ferroSockets.emitToClients: ' + gameId + ' ' + channel);
  if (this.sockets[gameId]) {
    for (let i = 0; i < this.sockets[gameId].length; i++) {
      if (this.sockets[gameId][i].ferropoly.isAdmin) {
        // For admins all messages are sent
        this.sockets[gameId][i].emit(channel, data);
      } else if (_.startsWith(channel, this.sockets[gameId][i].ferropoly.teamId)) {
        // forward only messages to a teams channel.
        // The channel name is formatted as follows:  'teamId-channelName'
        this.sockets[gameId][i].emit(channel, data);
      }
    }
  }
};

/**
 * Emit data to all admins of a game
 * @param gameId
 * @param channel
 * @param data
 */
FerroSocket.prototype.emitToAdmins = function (gameId, channel, data) {
  logger.debug('ferroSockets.emitToAdmins: ' + gameId + ' ' + channel);
  if (this.sockets[gameId]) {
    this.sockets[gameId].forEach(function (socket) {
      if (socket.ferropoly.isAdmin) {
        socket.emit(channel, data);
      }
    });
  }
};

/**
 * Emit data to a specific team of the game
 * @param gameId
 * @param teamId
 * @param channel
 * @param data
 */
FerroSocket.prototype.emitToTeam = function (gameId, teamId, channel, data) {
  logger.debug('ferroSockets.emitToTeam: ' + gameId + ' ' + teamId + ' ' + channel);
  data.msgId = uuid();
  if (this.sockets[gameId]) {
    this.sockets[gameId].forEach(function (socket) {
      if ((socket.ferropoly.isPlayer && socket.ferropoly.teamId === teamId)) {
        socket.emit(channel, data);
      }
    });
  }
};

/**
 * Emit data to a specific team of the game with CC to admins
 * @param gameId
 * @param teamId
 * @param channel
 * @param data
 */
FerroSocket.prototype.emitToTeamAndAdmin = function (gameId, teamId, channel, data) {
  logger.info('ferroSockets.emitToTeam: ' + gameId + ' ' + teamId + ' ' + channel);
  if (this.sockets[gameId]) {
    this.sockets[gameId].forEach(function (socket) {
      if ((socket.ferropoly.isPlayer && socket.ferropoly.teamId === teamId) || socket.ferropoly.isAdmin) {
        socket.emit(channel, data);
      }
    });
  }
};

/**
 * Emit data to all participants of a game (admins and players)
 * @param gameId
 * @param channel
 * @param data
 */
FerroSocket.prototype.emitToGame = function (gameId, channel, data) {
  logger.info(`ferroSockets.emitToGame: ${gameId}, ${channel}`);

  if (this.sockets[gameId]) {
    this.sockets[gameId].forEach(function (socket) {
      socket.emit(channel, data);
    });
  }
};

/**
 * Emit Game Log data to all participants of a game (admins and players)
 * @param gameId
 * @param message
 */
FerroSocket.prototype.emitGameLogMessageToGame = function (gameId, message) {
  logger.info(`ferroSockets.emitGameLogMessageToGame: ${gameId}`);

  if (this.sockets[gameId]) {
    this.sockets[gameId].forEach(function (socket) {
      if (socket.ferropoly.isAdmin) {
        message.title = _.get(message, 'title', 'Fehler!');
      } else {
        message.title = _.get(message, 'saveTitle', message.title);
      }
      delete message.saveTitle;
      socket.emit('game-log', message);
    });
  }
};

/**
 * Emits all game messages to a single socket after connecting
 */
FerroSocket.prototype.emitGameMessagesAfterConnect = function (gameId, socket) {
  gameLogModel.getLogEntries(gameId, null, moment().subtract(30, 'minutes'), null, (err, entries) => {
    if (err) {
      return logger.error(err);
    }

    entries.forEach(e => {
      let message = {
        title    : e.saveTitle,
        message  : e.message,
        category : e.category,
        timestamp: e.timestamp,
        id       : e._id
      }
      if (socket.ferropoly.isAdmin) {
        message.title = e.title;
      }
      socket.emit('game-log', message);
    });
  })
};

/**
 * the exports of the ferrorSocket module
 * @type {{create: Function, get: Function}}
 */
module.exports = {
  create: function (server) {
    ferroSocket = new FerroSocket(server);
    return ferroSocket;
  },

  get: function () {
    return ferroSocket;
  }
};
