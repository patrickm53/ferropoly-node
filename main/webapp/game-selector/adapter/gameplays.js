/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 22.10.21
 **/
import $ from 'jquery';

/**
 * Returns user information in the callback
 * @param callback
 */
function readGamePlays(callback) {
  $.ajax('/gameplays', {dataType: 'json'})
    .done(function (data) {
      console.log(data);
      callback(null, data);
    })
    .fail(function (err) {
      console.error(err);
      callback(err);
    })
    .always(function () {

    });
}

export {readGamePlays};
