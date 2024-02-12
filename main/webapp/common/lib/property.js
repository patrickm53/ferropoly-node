/**
 * Property Class for the Editor. This class is a property (as known from the
 * model) but is enhanced with functionality for the editor, like
 * Google Maps functionalities
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.08.21
 **/

import {merge, get} from 'lodash';
import EventEmitter from '../../common/lib/eventEmitter';



class Property extends EventEmitter {

  /**
   * Constructor
   * @param p is the property as in the Property Model, is merged with the object
   */
  constructor(p) {
    super();
    merge(this, p);
    this.marker          = null;
    this.isVisibleInList = true; // Flag indicating if the property is in the list or not

    // The Icons to use
    this.ICON_EDIT_LOCATION     = '/images/markers/selected.png';
    this.ICON_TRAIN_LOCATION    = '/images/markers/z-neutral.png';
    this.ICON_BUS_LOCATION      = '/images/markers/b-neutral.png';
    this.ICON_BOAT_LOCATION     = '/images/markers/s-neutral.png';
    this.ICON_CABLECAR_LOCATION = '/images/markers/v-neutral.png';
    this.ICON_OTHER_LOCATION    = '/images/markers/v-neutral.png';

    this.iconPriceLabels             = ['01.png', '02.png', '03.png', '04.png', '05.png', '06.png', '07.png', '08.png',
                                        '09.png', '10.png'];
    this.ICON_TRAIN_LOCATION_USED    = '/images/markers/32-b/z-';
    this.ICON_BUS_LOCATION_USED      = '/images/markers/32-b/b-';
    this.ICON_BOAT_LOCATION_USED     = '/images/markers/32-b/s-';
    this.ICON_CABLECAR_LOCATION_USED = '/images/markers/32-b/v-';
    this.ICON_OTHER_LOCATION_USED    = '/images/markers/32-b/v-';
  }

  /**
   * Creates a marker, if not already there.
   * A marker is mandatory for the property in order to be displayed
   * on the map
   */
  createMarker() {
    if (!google) {
      return;
    }
    if (this.marker) {
      return;
    }
    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: {
          lat: parseFloat(this.location.position.lat),
          lng: parseFloat(this.location.position.lng)
        },
        map     : null,
        title   : this.location.name,
      });
      this.marker.addListener('click', () => {
        this.emit('property-selected', this);
      });
      this.setMarkerIcon(false);
    }
  }

  /**
   * Sets the map of the Marker (makes it visible or not)
   * @param map Map object or null if not displaying on the map
   */
  setMap(map) {
    this.createMarker();
    if (this.marker) {
      this.marker.setMap(map);
    }
    this.map = map;
  }

  /**
   * Applies the filter (showing or map or not)
   * @param show
   */
  applyFilter(show) {
    if (show && !this.isVisibleInList) {
      if (this.marker) {
        this.marker.setMap(this.map);
      }
      this.isVisibleInList = true;
    } else if (!show && this.isVisibleInList) {
      if (this.marker) {
        this.marker.setMap(null);
      }
      this.isVisibleInList = false;
    }
  }

  /**
   * Returns the location of the property in google maps lat/lng-format
   * @returns {{lng: number, lat: number}}
   */
  getGoogleMapsLocation() {
    let lat = get(this, 'location.position.lat', '47.1');
    let lng = get(this, 'location.position.lng', '8.8');
    return {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };
  }
}

export default Property;
