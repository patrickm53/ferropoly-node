/**
 * An adapter for the static data
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 16.12.21
 **/
import axios from 'axios';
import {get} from 'lodash';

function getStaticData(gameId, callback) {
  axios.get(`/reception/static/${gameId}`)
    .then(resp => {
      console.log(resp.data);
      return callback(null, resp.data);
    })
    .catch(err => {
      return callback(get(err, 'response.data.message', null) || err.message);
    })
}

export {getStaticData}
