/**
 * Extends the Ferropoly Property object for the purposes used in the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.02.22
 **/

import Property from '../common/lib/property';
import {faHouseFlag} from '@fortawesome/free-solid-svg-icons';
import {get, set, isFunction} from 'lodash';
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
   * @param options : object customizing the icons. See function with details
   */
  setMap(map, options = {}) {
    this.map = map;
    let teamId             = get(options, 'teamId', '');
    let showAllTeamMarkers = get(options, 'showTeamMarkers', false);
    let owner              = get(this.gamedata, 'owner', undefined);

    if ((owner && showAllTeamMarkers) || (owner === teamId)) {
      let teamMarkerOptions = get(options, 'teamMarker', {});
      // Extract options, most important: external fill color function
      const fillColorFunc   = get(teamMarkerOptions, 'icon.fillColorFunc', null)
      if (isFunction(fillColorFunc)) {
        set(teamMarkerOptions, 'icon.fillColor', fillColorFunc(owner));
      }
      this.createTeamMarker(teamMarkerOptions);

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
   * @param options
   */
  createTeamMarker(options) {
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
        fillColor   : get(options, 'icon.fillColor', 'red'),
        fillOpacity : 1,
        anchor      : new google.maps.Point(
          faHouseFlag.icon[0] / 2, // width
          faHouseFlag.icon[1] // height
        ),
        strokeWeight: get(options, 'icon.strokeWeight', 1.2),
        strokeColor : get(options, 'icon.strokeColor', '0xffffff'),
        scale       : 0.05,
      }
    });
    this.teamMarker.addListener('click', () => {
      this.emit('property-selected', this);
    });


    // Build the info text according to the settings provided
    if (this.gamedata) {
      if (this.gamedata.owner) {
        let buildingText        = buildingStatus(this.gamedata.buildings);
        let buildingEnabledText = ''
        if (this.gamedata.buildings < 5) {
          if (this.gamedata.buildingEnabled) {
            buildingEnabledText = '<br>Hausbau ist möglich';
          } else {
            buildingEnabledText = '<br>Hausbau aktuell nicht möglich';
          }
        }
        const idToTeamName = get(options, 'idToTeamName', null);
        let content        = `<h4>${this.location.name}</h4><p>`;
        if (idToTeamName) {
          content += `Besitzer: ${idToTeamName(this.gamedata.owner)}<br>`;
        }
        content += `Kaufpreis ${formatPrice(this.pricelist.price)}<br>`;
        content += `Kaufzeit: ${formatTime(this.gamedata.boughtTs)}</p>`
        content += `Baustatus: ${buildingText} ${buildingEnabledText}`;

        this.infoWindow = new google.maps.InfoWindow({
          content: content
        })
        this.teamMarker.addListener('click', () => {
          this.openInfoWindow(this.teamMarker);
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
      this.openInfoWindow(this.marker);
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

      let priceTag = get(this, 'pricelist.priceTag', -1) - 1;
      if (selected) {
        this.marker.setIcon(this.ICON_EDIT_LOCATION);
      } else {
        switch (this.location.accessibility) {
          case 'train':
            // this.marker.setIcon(this.ICON_TRAIN_LOCATION);
            if (priceTag === -1) {
              this.marker.setIcon(this.ICON_TRAIN_LOCATION);
            } else {
              this.marker.setIcon(this.ICON_TRAIN_LOCATION_USED + this.iconPriceLabels[priceTag]);
            }

            break;

          case 'bus':
            if (priceTag === -1) {
              this.marker.setIcon(this.ICON_BUS_LOCATION);
            } else {
              this.marker.setIcon(this.ICON_BUS_LOCATION_USED + this.iconPriceLabels[priceTag]);
            }
            break;

          case 'boat':
            if (priceTag === -1) {
              this.marker.setIcon(this.ICON_BOAT_LOCATION);
            } else {
              this.marker.setIcon(this.ICON_BOAT_LOCATION_USED + this.iconPriceLabels[priceTag]);
            }
            break;

          case 'cablecar':
            if (priceTag === -1) {
              this.marker.setIcon(this.ICON_CABLECAR_LOCATION);
            } else {
              this.marker.setIcon(this.ICON_CABLECAR_LOCATION_USED + this.iconPriceLabels[priceTag]);
            }
            break;

          default:
            if (priceTag === -1) {
              this.marker.setIcon(this.ICON_OTHER_LOCATION);
            } else {
              this.marker.setIcon(this.ICON_OTHER_LOCATION_USED + this.iconPriceLabels[priceTag]);
            }
            break;
        }
      }
    }
  };
}

export default GameProperty;
