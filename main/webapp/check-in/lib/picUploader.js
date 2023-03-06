/**
 * Uploads a picture into the pic bucket
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.03.23
 **/

import axios from 'axios';
import geograph from "../../common/lib/geograph";
import {get} from "lodash";
import {DateTime} from 'luxon';

function announcePicture(gameId, teamId, options, callback) {
  const message          = get(options, 'message', undefined);
  const propertyId       = get(options, 'propertyId', undefined);
  const lastModifiedDate = get(options, 'lastModifiedDate', DateTime.now());
  const authToken        = get(options, 'authToken', 'nada');
  axios.post(`/picbucket/announce/${gameId}/${teamId}`, {
    position: geograph.getLastLocation(),
    message,
    propertyId,
    authToken,
    lastModifiedDate
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
  axios.put(uploadUrl, imageData, {
      headers: {
        'Content-Type': 'image/jpeg'
      }
    }
  ).then(() => {
    callback(null);
  }).catch(err => {
      console.error(err);
      callback(err);
    }
  )
}

/**
 * Confirms the upload of a picture
 * @param id
 * @param options
 * @param callback
 */
function confirmPicture(id, options, callback) {

  axios.post(`/picbucket/confirm/${id}`, {
    position: geograph.getLastLocation(),
  }).then(resp => {
    console.log('confirmed', resp.data);
    return callback(null, resp.data);
  }).catch(ex => {
    console.error(ex);
    callback(ex);
  })
}

export {announcePicture, uploadPicture, confirmPicture}
