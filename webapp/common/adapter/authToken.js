/**
 * Reads the auth Token
 * 13.4.21 KC
 */
import $ from 'jquery';

/**
 * Returns all games of this user  in the callback
 * @param callback
 */
function getAuthToken(callback) {
  $.ajax('/authtoken', {dataType: 'json'})
    .done(function (data) {
      callback(null, data.authToken);
    })
    .fail(function (err) {
      callback(err);
    });
}

export {getAuthToken};
