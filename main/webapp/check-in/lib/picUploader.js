/**
 * Uploads a picture into the pic bucket
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.03.23
 **/

import axios from 'axios';
import geograph from "../../common/lib/geograph";
import {get} from "lodash";
import $ from 'jquery'
function announcePicture(gameId, teamId, options, callback) {
  const message    = get(options, 'message', undefined);
  const propertyId = get(options, 'propertyId', undefined);
  const authToken  = get(options, 'authToken', 'nada');
  axios.post(`/picbucket/announce/${gameId}/${teamId}`, {
    position: geograph.getLastLocation(),
    message,
    propertyId,
    authToken
  }).then(resp => {
    console.log('announced', resp.data);
    return callback(null, resp.data);
  }).catch(ex => {
    console.error(ex);
    callback(ex);
  })
}

/**
 * Uploads a picture
 * @param uploadUrl
 * @param imageData
 * @param callback
 */
function uploadPicture(uploadUrl, imageData, callback) {
  console.log('image', imageData);
  axios.put(uploadUrl, imageData, {
      headers: {
        'Content-Type':  'image/jpeg'
      }
    }
  ).then(data => {
    callback(null);
  }).catch(err => {
      console.error(err);
      callback(err);
    }
  )
}
function confirmPicture() {

}

export {announcePicture, uploadPicture}
