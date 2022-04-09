/**
 * Extends the Ferropoly Property object for the purposes used in the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.02.22
 **/

import Property from '../common/lib/property';
import {faHouseFlag} from '@fortawesome/free-solid-svg-icons';
import {get} from 'lodash';
import {buildingStatus, formatTime, formatPrice} from '../common/lib/formatters';

class GameProperty extends Property {
  constructor(p) {
    super(p);

    this.teamMarker = null; // Marker which is displayed when property status (belongs to team) is important

    this.on('property-selected', p => {
      console.log('hold on, property selected', p);
    })
  }

  /**
   * Set Map override: when a teamId is supplied, we have different markers
   * @param map
   * @param teamId
   */
  setMap(map, teamId = '') {
    if (get(this.gamedata, 'owner', 'none') === teamId) {
      this.createTeamMarker();
      this.teamMarker.setMap(map);
      if (this.marker) {
        this.marker.setMap(null);
      }
    } else {
      if (this.teamMarker) {
        this.teamMarker.setMap(null);
      }
      super.setMap(map);
    }
  }

  /**
   * Creates a Team Marker, a special colored and shaped marker with info about an own property
   */
  createTeamMarker() {
    if (!google) {
      return;
    }
    if (this.teamMarker) {
      this.teamMarker.setMap(null);
    }

    this.teamMarker = new google.maps.Marker({
      position: {
        lat: parseFloat(this.location.position.lat),
        lng: parseFloat(this.location.position.lng)
      },
      map     : null,
      title   : this.location.name,
      icon    : {
        path        : faHouseFlag.icon[4],
        fillColor   : 'blue',
        fillOpacity : 1,
        anchor      : new google.maps.Point(
          faHouseFlag.icon[0] / 2, // width
          faHouseFlag.icon[1] // height
        ),
        strokeWeight: 1,
        strokeColor : '#ffffff',
        scale       : 0.05,
      }
    });
    this.teamMarker.addListener('click', () => {
      this.emit('property-selected', this);
    });


    // Build the info text
    if (this.gamedata) {
      console.log('gamedata', this.gamedata);
      if (this.gamedata.owner) {
        let buildingText = buildingStatus(this.gamedata.buildings);
        let buildingEnabledText = ''
        if (this.gamedata.buildings < 5) {
          if (this.gamedata.buildingEnabled) {
            buildingEnabledText = '<br>Hausbau ist möglich';
          } else {
            buildingEnabledText = '<br>Hausbau aktuell nicht möglich';
          }
        }
        let content = `<h4>${this.location.name}</h4>`
        content += `<p>Kaufpreis ${formatPrice(this.pricelist.price)}<br>`;
        content += `Kaufzeit: ${formatTime(this.gamedata.boughtTs)}</p>`
        content += `Baustatus: ${buildingText} ${buildingEnabledText}`;

        this.infoWindow = new google.maps.InfoWindow({
          content: content
        })
        this.teamMarker.addListener('click', () => {
          this.infoWindow.open(this.map, this.teamMarker);
        });
      } else {
        console.warn('Tried to show gamedata to a prop not belonging to team', this);
      }
    }
  }

  /**
   * Creating a marker
   */
  createMarker() {
    super.createMarker();

    let content = `<h4>${this.location.name}</h4><p>Kaufpreis: ${this.pricelist.price}</p>`;

    if (this.gamedata) {
      console.log('gamedata', this.gamedata);
      if (this.gamedata.owner) {
        content += `<p>verkauft</p>`
      } else {
        content += `<p>verfügbar</p>`
      }
    }

    this.infoWindow = new google.maps.InfoWindow({
      content: content
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
