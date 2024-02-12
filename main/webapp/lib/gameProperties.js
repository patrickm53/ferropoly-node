/**
 * This is the collection of all properties belonging to the game. Adding, calculating values, showing or
 * hiding on map => all done with this collection
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 26.02.22
 **/
import GameProperty from './gameProperty';
import {assign, filter, find, findIndex, get, set} from 'lodash';


const priceTags = [
  /* 0 = does not exist  */ [],
  /* 1 = all have different price */ [],
  /* 2 */ [1, 10],
  /* 3 */ [1, 5, 10],
  /* 4 */ [1, 3, 6, 10],
  /* 5 */ [1, 3, 5, 7, 10],
  /* 6 */ [1, 3, 5, 7, 9, 10],
  /* 7 */ [1, 2, 3, 5, 7, 9, 10],
  /* 8 */ [1, 2, 3, 4, 6, 7, 9, 10],
  /* 9 */ [1, 2, 3, 4, 6, 7, 8, 9, 10],
  /* 10 */ [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
]

class GameProperties {
  /**
   * We're expecting an array of gameProperty objects as parameter (or none)
   * @param options
   */
  constructor(options) {
    console.log('Creating new GameProperties...', options);
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
    prop2push.pricelist.priceTag = this.getPriceTag(prop2push);
    this.properties.push(prop2push);
  }

  /**
   * Returns the number of properties in the list
   * @returns {number}
   */
  getNumberOfProperties() {
    return this.properties.length;
  }

  /**
   * Returns the number of free properties
   */
  getFreePropertiesNb() {
    return this.getNumberOfProperties() - this.getBoughtPropertiesNb();
  }

  /**
   * Returns the number of bought propertes
   * @returns {number}
   */
  getBoughtPropertiesNb() {
    let boughtProps = filter(this.properties, p => {
      return get(p, 'gamedata.owner', undefined) !== undefined;
    });
    return boughtProps.length;
  }

  /**
   * Returns the number of built houses
   * @returns {number}
   */
  getNumberOfBuiltHouses() {
    let nb = 0;
    this.properties.forEach(p => {
      nb += get(p, 'gamedata.buildings', 0);
    })
    return nb;
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
   * Calculates the price tag for a given property based on the price levels defined in the gameplay parameters.
   *
   * @param {object} property - The property for which the price tag is calculated.
   * @return {number} - The price tag of the property.
   */
  getPriceTag(property) {
    const lowestPrice         = this.gameplay.gameParams.properties.lowestPrice;
    const highestPrice        = this.gameplay.gameParams.properties.highestPrice;
    const priceDelta          = highestPrice - lowestPrice;
    const numberOfPriceLevels = this.gameplay.gameParams.properties.numberOfPriceLevels
    let step                  = priceDelta / numberOfPriceLevels;
    let priceTag              = -1;

    if (numberOfPriceLevels > 1 && numberOfPriceLevels < 11) {
      // When there are between 2 and 10 Price levels, use mapping
      for (let i = 0; i < numberOfPriceLevels; i++) {
        let priceLevel = lowestPrice + i * step;
        if (property.pricelist.price >= priceLevel) {
          priceTag = priceTags[numberOfPriceLevels][i];
        }
      }
      return priceTag;
    } else {
      // The less common situation: more than 10 different price levels. This is only approximately calculation
      step = priceDelta / 10;
      for (let i = 0; i < 10; i++) {
        let priceLevel = lowestPrice + i * step;
        if (property.pricelist.price >= priceLevel) {
          priceTag = priceTags[10][i];
        }
      }
      return priceTag;
    }
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
    prop2Update.pricelist.priceTag = this.getPriceTag(prop2Update);
    let i                          = findIndex(this.properties, {uuid: prop2Update.uuid});
    if (i > -1) {
      assign(this.properties[i], prop2Update);
      console.log(`updated ${prop2Update.location.name}`);
    }
    return prop2Update;
  }

  /**
   * Enables building for all properties
   */
  enableBuilding() {
    this.properties.forEach(p => {
      set(p, 'gamedata.buildingEnabled', true);
    });
  }

  /**
   * Show all properties on the map
   * @param map
   */
  showAllPropertiesOnMap(map) {
    console.log('SHOW ALL PROPS!!')
    this.properties.forEach(p => {
      p.setMap(map);
    });
  }

  /**
   * Shows only the free properties on the map.
   *
   * @param {Map} map - The map object where properties will be displayed.
   * @return {void}
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
   * Shows only the properties of a team on a map.
   *
   * @param {google.maps.Map} map - The Google Maps map object.
   * @param {string} teamUuid - The UUID of the team.
   * @return {undefined}
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
   * Shows all properties, but highlights properties of the team on the map
   * @param map
   * @param options are passed 1:1 to the gameProperty.setMap function, see there
   */
  showAllPropertiesWithTeamProps(map, options) {
    this.properties.forEach(p => {
      p.setMap(map, options);
    });
  }


  /**
   * Hides all properties on the map.
   *
   * @returns {void}
   */
  hideAllPropertiesOnMap() {
    this.properties.forEach(p => {
      p.setMap(null);
    });
  }

  /**
   * Evaluates the property value for a given team.
   *
   * @param {number} teamId - The ID of the team.
   * @return {Object} - The evaluation result with the sum and maximum value.
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
