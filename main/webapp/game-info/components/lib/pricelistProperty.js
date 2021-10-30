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
   * Set the icon for this location in the map, this is editor specific
   * @param editMode true if editing the item
   */
  setMarkerIcon(editMode) {
    if (this.marker) {
      let x = -1;
      if (this.pricelist) {
        x = this.pricelist.priceRange;
      }
      if (editMode) {
        this.marker.setIcon(ICON_EDIT_LOCATION);
      } else {
        switch (this.location.accessibility) {
          case 'train':
            if (x === -1) {
              this.marker.setIcon(ICON_TRAIN_LOCATION);
            } else {
              this.marker.setIcon(ICON_TRAIN_LOCATION_USED + iconPriceLabels[x]);
            }
            break;

          case 'bus':
            if (x === -1) {
              this.marker.setIcon(ICON_BUS_LOCATION);
            } else {
              this.marker.setIcon(ICON_BUS_LOCATION_USED + iconPriceLabels[x]);
            }
            break;

          case 'boat':
            if (x === -1) {
              this.marker.setIcon(ICON_BOAT_LOCATION);
            } else {
              this.marker.setIcon(ICON_BOAT_LOCATION_USED + iconPriceLabels[x]);
            }
            break;

          case 'cablecar':
            if (x === -1) {
              this.marker.setIcon(ICON_CABLECAR_LOCATION);
            } else {
              this.marker.setIcon(ICON_CABLECAR_LOCATION_USED + iconPriceLabels[x]);
            }
            break;

          default:
            if (x === -1) {
              this.marker.setIcon(ICON_OTHER_LOCATION);
            } else {
              this.marker.setIcon(ICON_OTHER_LOCATION_USED + iconPriceLabels[x]);
            }
            break;
        }
      }
    }
  };
}

export default PricelistProperty;
