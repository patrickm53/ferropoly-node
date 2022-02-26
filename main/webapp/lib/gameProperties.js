/**
 * This is the collection of all properties belonging to the game. Adding, calculating values, showing or
 * hiding on map => all done with this collection
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 26.02.22
 **/
import GameProperty from './gameProperty';
import {assign, filter, find, findIndex, get} from 'lodash';

class GameProperties {
  /**
   * We're expecting an array of gameProperty objects as parameter (or none)
   * @param properties
   */
  constructor(properties) {
    this.properties = properties || [];
  }

  /**
   * Pushes a property into the list
   * @param property
   */
  pushProperty(property) {
    let prop2push = property;

    if (!property instanceof GameProperty) {
      prop2push = new GameProperty(property);
    }
    this.properties.push(prop2push);
  }

  /**
   * Returns a property by its id
   * @param id
   * @returns {unknown}
   */
  getPropertyById(id) {
    return find(this.properties, {uuid: id});
  }

  /**
   * Just returns the first property
   * @returns {*}
   */
  getFirstProperty() {
    return this.properties[0];
  }

  /**
   * Returns the number of properties of a team
   * @param teamId
   * @returns {number}
   */
  getNbOfPropertiesOfTeam(teamId) {
    let ownProps = filter(this.properties, p => {
      return p.gamedata.owner === teamId;
    })
    return ownProps.length;
  }

  /**
   * Updates a property in the list
   * @param property is either a Property-Model object or a GameProperty object
   * @returns {GameProperty} the updated object
   */
  updateProperty(property) {
    let prop2Update = property;

    if (!property instanceof GameProperty) {
      prop2Update = new GameProperty(property);
    }
    let i = findIndex(this.properties, {uuid: prop2Update.uuid});
    if (i > -1) {
      assign(this.properties[i], prop2Update);
      console.log(`updated ${prop2Update.location.name}`);
    }
    return prop2Update;
  }

  /**
   * Show all properties on the map
   * @param map
   */
  showAllPropertiesOnMap(map) {
    this.properties.forEach(p => {
      p.setMap(map);
    });
  }

  /**
   * Show only free properties on the map
   * @param map
   */
  showOnlyFreePropertiesOnMap(map) {
    this.properties.forEach(p => {
      if (p.isAvailable()) {
        p.setMap(map);
      } else {
        p.setMap(null);
      }
    });
  }

  /**
   * Shows only the properties of a team on the map
   * @param map
   * @param teamUuid
   */
  showOnlyPropertiesOfTeamOnMap(map, teamUuid) {
    this.properties.forEach(p => {
      if (get(p, 'gamedata.owner', '') === teamUuid) {
        p.setMap(map);
      } else {
        p.setMap(null);
      }
    });
  }

  /**
   * Hides (deletes) all properties on a map
   */
  hideAllPropertiesOnMap() {
    this.properties.forEach(p => {
      p.setMap(null);
    });
  }
}

export {GameProperties};
