/**
 * Class containing all meta data of a picture
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.03.23
 **/
import {get, toNumber} from "lodash";
import {DateTime} from 'luxon';

class PictureInfo {
  constructor(info) {
    this.id               = info._id;
    this.teamId           = info.teamId;
    this.message          = info.message;
    this.url              = info.url;
    this.thumbnail        = info.thumbnail;
    this.propertyId       = info.propertyId;
    this.position         = {
      lat     : toNumber(get(info, 'position.lat', '0')),
      lng     : toNumber(get(info, 'position.lng', '0')),
      accuracy: toNumber(get(info, 'position.accuracy', '2000')),
    }
    this.timestamp        = DateTime.fromISO(info.timestamp);
    this.lastModifiedDate = DateTime.fromISO(info.lastModifiedDate);
  }
}

export default PictureInfo;
