/**
 * Check-In socket connection
 * Created by kc on 14.01.16.
 */

'use strict';

$('#offline').show();
$('#online').hide();

var ferropolySocket = io.connect();

ferropolySocket.on('disconnect', function () {
  console.log('disconnected');
  $('#offline').show();
  $('#online').hide();
});
ferropolySocket.on('test', function (data) {
  console.log('test: ' + data);
});

ferropolySocket.on('identify', function () {
  console.log('identify received');
  console.log(ferropoly.authToken);
  ferropolySocket.emit('identify', {
    user     : ferropoly.user,
    teamId   : ferropoly.team.uuid,
    authToken: ferropoly.authToken,
    gameId   : ferropoly.gameplay.internal.gameId
  });
});

ferropolySocket.on('welcome', function (data) {
  console.log('Welcome Data', data);
});

// Now the initialized connection in set up
ferropolySocket.on('initialized', function () {
  console.log('initialized: SOCKET.IO is online');

  checkinDatastore.dataStore.attachSocket(ferropolySocket);
  // Now we are really online
  $('#online').show();
  $('#offline').hide();

});

ferropolySocket.on('connection', function () {
  // Next the server issues an 'identify' request
  console.log('socket.io connection event');
});
ferropolySocket.on('connect', function () {
  // Next the server issues an 'identify' request
  console.log('socket.io connect event');
});
ferropolySocket.on('connect_error', function (obj) {
  // Next the server issues an 'identify' request
  console.log('socket.io connect_error event');
  console.log(obj);
});
ferropolySocket.on('reconnect', function () {
  // Next the server issues an 'identify' request
  console.log('socket.io reconnect event');
});
ferropolySocket.on('reconnect_attempt', function () {
  // Next the server issues an 'identify' request
  console.log('socket.io reconnect_attempt event');
});
ferropolySocket.on('reconnecting', function () {
  console.log('socket.io reconnecting event');
});


ferropolySocket.on('reconnect_error', function () {
  console.log('socket.io reconnect_error event');
});


ferropolySocket.on('reconnect_failed', function () {
  console.log('socket.io reconnect_failed event');
});


