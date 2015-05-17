/**
 * Socket.io connection for the complete reception
 * Created by kc on 10.05.15.
 */
'use strict';

var ferropolySocket = io.connect();


$('#offline').show();
$('#online').hide();

ferropolySocket.on('disconnect', function() {
  console.log('disconnected');
  $('#offline').show();
  $('#online').hide();
});
ferropolySocket.on('test', function(data) {
  console.log('test: ' + data);
});

ferropolySocket.on('identify', function() {
  console.log('identify received');
  console.log(ferropoly.authToken);
  ferropolySocket.emit('identify', {user: ferropoly.user, authToken: ferropoly.authToken, gameId: ferropoly.gp.internal.gameId});
});

// Now the initialized connection in set up
ferropolySocket.on('initialized', function() {
  console.log('initialized');

  // Now we are really online
  $('#online').show();
  $('#offline').hide();

});

ferropolySocket.on('connect', function(){
  // Next the server issues an 'identify' request
  console.log('connected');
});


