/**
 * Loads the Google APIs and provides them to all consuments
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.08.21
 **/

import {Loader} from '@googlemaps/js-api-loader';

// Hell, yes, this is the API Key in code, git and everywhere... So far I was not able
// to find a better solution, have to check this out. But don't be too happy about finding
// a 'free' API key, it is restricted to the ferropoly infrastructure, consider it as
// useless...
const API_KEY = 'AIzaSyBUF_iMSAIZ4VG6rjpGvTntep-_x2zuAqw';

const loader = new Loader({
  apiKey   : API_KEY,
  version  : 'weekly',
  libraries: ['places']
});

class GoogleLoader {
  constructor() {
    this.google = null;
  }

  load(callback)  {
    loader
      .load()
      .then((google) => {
        console.log('Google APIs loaded');
        this.google = google;
        callback(null, this.google);
      })
      .catch(e => {
        console.error('Error while loading Google API', e);
        this.google = null;
        callback(e);
      });
  }

  getGoogleInstance() {
    return this.google;
  }
}

let gl = new GoogleLoader();

export default gl;
