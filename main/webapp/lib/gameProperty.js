/**
 * Extends the Ferropoly Property object for the purposes used in the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.02.22
 **/

import Property from '../common/lib/property'

class GameProperty extends Property {
  constructor(p) {
    super(p);

    this.on('property-selected', p => {
      console.log('hold on, property selected', p);
    })
  }

  /**
   * Creating a marker
   */
  createMarker() {
    super.createMarker();

    this.infoWindow = new google.maps.InfoWindow({
      content: `<h4>${this.location.name}</h4><p>Kaufpreis: ${this.pricelist.price}</p>`
    })
    this.marker.addListener('click', () => {
      this.infoWindow.open(this.map, this.marker);
    });
  }

  /**
   * Returns true if the property is still avilable
   * @returns {boolean}
   */
  isAvailable() {
    return (typeof this.gamedata.owner === 'undefined')
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
