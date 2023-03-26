/**
 * Class containing all meta data of a picture
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.03.23
 **/
import {get, split, toNumber} from "lodash";
import {DateTime} from 'luxon';

class PictureInfo {
  constructor(info) {
    this.id               = info._id;
    this.teamId           = info.teamId;
    this.message          = info.message;
    this.url              = info.url;
    this.thumbnail        = info.thumbnail;
    this.propertyId       = info.propertyId || null;
    this.position         = {
      lat     : toNumber(get(info, 'position.lat', '0')),
      lng     : toNumber(get(info, 'position.lng', '0')),
      accuracy: toNumber(get(info, 'position.accuracy', '2000')),
    }
    this.timestamp        = DateTime.fromISO(info.timestamp);
    this.lastModifiedDate = DateTime.fromISO(info.lastModifiedDate);
    this.location         = info.location;
  }

  /**
   * Returns the location text out of the Google Geolocation data
   * @returns {string|null}
   */
  getLocationText() {
    const self = this;
    let results = get(self, 'location.results', null);
    if (!results) {
      return null;
    }
    let address = get(results, '[0].formatted_address', null);
    if (!address) {
      return null;
    }
    return split(address, ', Switzerland')[0];
  }

  /**
   * Gets active when the modification date is much older than the upload date
   * @returns {boolean}
   */
  warningTooOldPictureActive() {
    if (!this.lastModifiedDate) {
      return false;
    }
    const diff = this.timestamp.diff(this.lastModifiedDate, 'hours');
    return diff > 12;
  }
}

export default PictureInfo;
