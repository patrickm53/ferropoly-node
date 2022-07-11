/**
 * Reads the information about the user
 */
import $ from 'jquery';

/**
 * Returns user information in the callback
 * @param callback
 */
function readUserInfo(callback) {
  $.ajax('/userInfo', {dataType: 'json'})
    .done(function (data) {
      console.log(data);
      callback(null, data.info);
    })
    .fail(function (err) {
      console.error(err);
      callback(err);
    })
    .always(function () {

    });
}

export {readUserInfo};
