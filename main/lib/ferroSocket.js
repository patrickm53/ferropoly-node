/**
 * The socket.io connection to the client. All data is received here, all data sent to the client is
 * sent by this module.
 * Created by kc on 10.05.15.
 */
'use strict';
var EventEmitter = require('events').EventEmitter;
var authTokenManager = require('./authTokenManager');

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
  this.io = require('socket.io')(server);
  this.sockets = {};

  /**
   * New client connects, verifiy its identity and if suceeded, add to the trusted
   * sockets (otherwise disconnect)
   */
  this.io.on('connection', function (socket) {
    socket.on('identify', function (data) {
      authTokenManager.verifyToken(data.user, data.authToken, function (err) {
        if (err) {
          console.log('Invalid socket');
          socket.disconnect();
          return
        }
        console.log('Verified socket added for ' + data.gameId + ' : ' + socket.id);
        self.addSocket(socket, data.gameId);
        self.registerChannels(socket);
      });
    });
    socket.emit('identify', {});

    socket.on('disconnect', function () {
      console.log('disconnected socket ' + socket.id);
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
    console.log('Socketmanager: new socket added ' + socket.id);
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

  socket.on('test', function (data) {
    console.log('test data received:' + data);
    socket.emit('test', {h: 'olla'});
  });

  socket.on('teamAccount', function (data) {
    console.log('teamAccount request received:' + data.cmd.name);
    data.gameId = socket.gameId;
    data.response = function (channel, resp) {
      self.emitToClients(socket.gameId, channel, resp);
    };
    self.emit('teamAccount', data);
  });

  socket.on('propertyAccount', function (data) {
    console.log('propertyAccount request received:' + data.cmd.name);
    data.gameId = socket.gameId;
    data.response = function (channel, resp) {
      self.emitToClients(socket.gameId, channel, resp);
    };
    self.emit('propertyAccount', data);
  });

  socket.on('chancelleryAccount', function (data) {
    console.log('chancelleryAccount request received:' + data.cmd.name);
    data.gameId = socket.gameId;
    data.response = function (channel, resp) {
      self.emitToClients(socket.gameId, channel, resp);
    };
    self.emit('chancelleryAccount', data);
  });

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
  console.log('ferroSockets.emitToClients: ' + gameId + ' ' + channel);
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
