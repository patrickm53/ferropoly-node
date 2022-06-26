/**
 * Auth Token functions
 * 13.4.21 KC
 */
import $ from 'jquery';
import axios from 'axios';

/**
 * Returns all games of this user  in the callback
 * @param callback
 */
function getAuthToken(callback) {
  $.ajax('/authtoken', {dataType: 'json'})
    .done(function (data) {
      callback(null, data.authToken);
    })
    .fail(function () {
      callback({message: 'Fehler 401: Du scheinst nicht eingeloggt zu sein, bitte lade die Seite neu.'});
    });
}

/**
 * Verifies the auth token. I had some quite nasty problems with expired and wrong tokens, hard to debug. This
 * function shall help to find the reason for this (while providing a little fix)
 * @param authToken
 * @param callback
 */
function verifyAuthToken(authToken, callback) {
  axios.post('/authtoken/test', {authToken})
    .then(() => {
      console.log('Auth-Token verification suceeded');
      callback(null);
    })
    .catch(() => {
      console.warn('Auth-Token verification failed');
      callback(new Error('Auth-Token verification failed'));
    })
}

export {getAuthToken, verifyAuthToken};
