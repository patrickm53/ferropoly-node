/**
 * Adapter to the price list
 * 13.4.21 KC
 */
import $ from 'jquery';
import axios from 'axios';
import {get} from 'lodash';

/**
 * Returns the pricelist for a game play
 * @param gameId
 * @param callback
 */
function getPricelist(gameId, callback) {
  $.ajax(`/pricelist/get/${gameId}`, {dataType: 'json'})
    .done(function (data) {
      callback(null, data);
    })
    .fail(function (err) {
      console.error(err);
      callback(err);
    });
}

function createPricelist(gameId, authToken, callback) {
  axios.post('/pricelist/create',
    {
      gameId,
      authToken
    })
    .then(function () {
      callback(null);
    })
    .catch(function (error) {
      let message = get(error, 'response.data.message', error);
      callback({message});
    });
}

export {getPricelist, createPricelist};
