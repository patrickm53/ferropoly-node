/**
 * Socket.io connection for the complete reception
 * Created by kc on 10.05.15.
 */
'use strict';

var ferropolySocket = io.connect();

ferropolySocket.on('disconnect', function() {
  console.log('disconnected');
});
ferropolySocket.on('test', function(data) {
  console.log('test: ' + data);
});

ferropolySocket.on('identify', function() {
  console.log('identify received');
  ferropolySocket.emit('identify', {user: ferropoly.user, authToken: ferropoly.authToken, gameId: ferropoly.gp.internal.gameId});
});

// Now the initialized connection in set up
ferropolySocket.on('initialized', function() {
  console.log('connected');
  ferropolySocket.emit('test', '123');
});


