/**
 * A Porperty for the pricelist
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 30.10.21
 **/

import Property from '../../../common/lib/property';

class PricelistProperty extends Property {

  /**
   * Constructor
   * @param p is the property as in the Property Model, is merged with the object
   */
  constructor(p) {
    super(p);
  }

  /**
   * Set the icon for this location in the map, this is main specific, for pricelist
   * @param selected true if the item was selected
   */
  setMarkerIcon(selected) {
    if (this.marker) {

      if (selected) {
        this.marker.setIcon(this.ICON_EDIT_LOCATION);
      } else {
        switch (this.location.accessibility) {
          case 'train':
            this.marker.setIcon(this.ICON_TRAIN_LOCATION);
            break;

          case 'bus':
            this.marker.setIcon(this.ICON_BUS_LOCATION);
            break;

          case 'boat':
            this.marker.setIcon(this.ICON_BOAT_LOCATION);
            break;

          case 'cablecar':
            this.marker.setIcon(this.ICON_CABLECAR_LOCATION);
            break;

          default:
            this.marker.setIcon(this.ICON_OTHER_LOCATION);
            break;
        }
      }
    }
  };
}

export default PricelistProperty;
