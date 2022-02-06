/**
 * Extends the Ferropoly Property object for the purposes used in the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.02.22
 **/

import Property from '../common/lib/property'

class GameProperty extends Property {
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
           // this.marker.setIcon(this.ICON_TRAIN_LOCATION);
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

export default GameProperty;
