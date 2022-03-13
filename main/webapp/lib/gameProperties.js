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
   * @param options
   */
  constructor(options) {
    this.properties = get(options, 'properties', []);
    this.gameplay   = get(options, 'gameplay', {
      gameParams: {
        rentFactors: {
          allPropertiesOfGroup: 2
        }
      }
    });
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
   * Returns the properties of a team
   * @param teamId
   * @returns {string[]}
   */
  getPropertiesOfTeam(teamId) {
    return filter(this.properties, p => {
      return get(p, 'gamedata.owner', 'x') === teamId;
    });
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
    let ownProps = this.getPropertiesOfTeam(teamId);
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

  /**
   * Evaluates the value of all properties belongig to a team
   * @param teamId
   * @returns {{max: number, sum: number}}
   */
  evaluatePropertyValueForTeam(teamId) {
    let props  = this.getPropertiesOfTeam(teamId);
    let retVal = {
      sum: 0,
      max: 0
    }
    props.forEach(p => {
      retVal.sum += this.evaluatePropertyValue(p);
      retVal.max += this.evaluatePropertyValue(p, 5);
    })
    return retVal;
  }

  /**
   * Returns the value of the property for rent and interest. This function checks also if a group belongs to one team
   * Pretty much the same as gound in propertyAccount.js in the backend, but it is implemented here as I consider it
   * better performing in the frontend: do not use too much calculating power in the backend just for a nerdy stats!
   * @param property
   * @param calculateWithBuildingNb number of buildings which shall be used for calculation, leave empty if game decides
   * @returns {*}
   */
  evaluatePropertyValue(property, calculateWithBuildingNb = -1) {
    let propertyGroup = get(property, 'pricelist.propertyGroup', -1);
    let properties    = filter(this.properties, p => {
      return p.pricelist.propertyGroup === propertyGroup;
    });

    let sameGroup = 0;
    for (let i = 0; i < properties.length; i++) {
      if (get(properties[i], 'gamedata.owner', 'che') === get(property, 'gamedata.owner', 'ge')) {
        sameGroup++;
      }
    }
    let retVal = {};
    let factor = 1;
    if ((properties.length > 1) && (sameGroup === properties.length)) {
      // all properties in a group belong the same team, pay more!
      factor = this.gameplay.gameParams.rentFactors.allPropertiesOfGroup || 2;
      console.log(`Properties in group ${propertyGroup} count ${factor} x`);
    }

    let rent = 0;
    let buildingNb;
    if (calculateWithBuildingNb >= 0) {
      buildingNb = calculateWithBuildingNb;
    } else {
      buildingNb = property.gamedata.buildings || 0;
    }

    switch (buildingNb) {
      case 0:
        rent = property.pricelist.rents.noHouse;
        break;
      case 1:
        rent = property.pricelist.rents.oneHouse;
        break;
      case 2:
        rent = property.pricelist.rents.twoHouses;
        break;
      case 3:
        rent = property.pricelist.rents.threeHouses;
        break;
      case 4:
        rent = property.pricelist.rents.fourHouses;
        break;
      case 5:
        rent = property.pricelist.rents.hotel;
        break;
      default:
        console.warn('invalid building nb', property);
    }

    retVal.amount = rent * factor;
    retVal.uuid   = property.uuid;
    return retVal.amount;
  };


}

export {GameProperties};
