/**
 * The socket.io connection to the client. All data is received here, all data sent to the client is
 * sent by this module.
 * Created by kc on 10.05.15.
 */
'use strict';
var EventEmitter = require('events').EventEmitter;
var authTokenManager = require('./authTokenManager');
var logger = require('../../common/lib/logger').getLogger('ferroSocket');
var settings = require('../settings');
var _ = require('lodash');
var util = require('util');
var ferroSocket;

/**
 * Constructor of the FerroSocket
 * @param server
 * @constructor
 */
var FerroSocket = function (server) {
  EventEmitter.call(this);
  var self = this;
  this.io = require('socket.io').listen(server);

  this.sockets = {};

  this.io.on('connect', function (socket) {
    logger.info('io connect event');
  });
  this.io.on('connection', function (socket) {
    logger.info('io connection event');
    socket.emit('welcome', {
      name: settings.name,
      appName: settings.appName,
      version: settings.version,
      debug: settings.debug,
      preview: settings.preview
    });
  });
  this.io.on('connect_error', function (obj) {
    logger.info('io connect_error event');
    logger.info(obj);
  });
  this.io.on('connect_timeout', function (socket) {
    logger.info('io connect_timeout event');
  });
  this.io.on('reconnect', function (socket) {
    logger.info('io reconnect event');
  });
  this.io.on('reconnect_attempt', function (socket) {
    logger.info('io reconnect_attempt event');
  });
  this.io.on('reconnecting', function (socket) {
    logger.info('io reconnecting event');
  });
  this.io.on('reconnect_error', function (socket) {
    logger.info('io reconnect_error event');
  });
  this.io.on('reconnect_failed', function (socket) {
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
        logger.info('Verified socket added for ' + data.gameId + ' : ' + socket.id);
        self.addSocket(socket, data.gameId);
        self.registerChannels(socket);
      });
    });
    socket.emit('identify', {});

    socket.on('disconnect', function () {
      logger.info('disconnected socket ' + socket.id);
      self.removeSocket(socket);

    });
  });
};

util.inherits(FerroSocket, EventEmitter);
/**
 * Add a socket after connection
 * @param socket
 * @param gameId
 */
FerroSocket.prototype.addSocket = function (socket, gameId) {
  if (!this.sockets[gameId]) {
    this.sockets[gameId] = [];
  }
  if (!_.includes(this.sockets[gameId], socket)) {
    socket.gameId = gameId;
    this.sockets[gameId].push(socket);
    logger.info('Socketmanager: new socket added ' + socket.id);
  }
};

/**
 * Remove a socket after disconnection
 * @param socket
 */
FerroSocket.prototype.removeSocket = function (socket) {
  _.forIn(this.sockets, function (value, key) {
    if (_.isArray(value)) {
      _.remove(value, function (s) {
        return s === socket;
      });
    }
  });
};

FerroSocket.prototype.registerChannels = function (socket) {
  var self = this;

  function registerChannel(channelName) {
    socket.on(channelName, function (data) {
      logger.info(channelName + ' request received:' + data.cmd);
      data.gameId = socket.gameId;
      data.response = function (channel, resp) {
        self.emitToClients(socket.gameId, channel, resp);
      };
      self.emit(channelName, data);
    });
  }

  registerChannel('propertyAccount');
  registerChannel('chancelleryAccount');
  registerChannel('properties');
  registerChannel('marketplace');

  // Say the socket that we are operative
  socket.emit('initialized', {result: true});
};
/**
 * Emit data to all clients belonging to a given gameId
 * @param gameId
 * @param channel
 * @param data
 */
FerroSocket.prototype.emitToClients = function (gameId, channel, data) {
  logger.info('ferroSockets.emitToClients: ' + gameId + ' ' + channel);
  if (this.sockets[gameId]) {
    for (var i = 0; i < this.sockets[gameId].length; i++) {
      this.sockets[gameId][i].emit(channel, data);
    }
  }
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
