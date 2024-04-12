/**
 * Common library for the pricelist
 * Created by kc on 26.04.15.
 */


const _             = require('lodash');
const properties    = require('../models/propertyModel');
const gameplayModel = require('../models/gameplayModel');
const logger        = require('./logger').getLogger('lib:pricelist');
const moment        = require('moment');

module.exports = {
  /**
   * Get the price list for a given game
   * @param gameId
   * @param callback
   */
  getPricelist: function (gameId, callback) {
    properties.getPropertiesForGameplay(gameId, null, function (err, props) {
      if (err) {
        return callback(err);
      }
      let pricelist = _.filter(props, function (p) {
        return p.pricelist.position > -1;
      });

      // Filter unused data
      for (let i = 0; i < pricelist.length; i++) {
        pricelist[i].gamedata = undefined;
        pricelist[i]._id      = undefined;
        pricelist[i].__v      = undefined;
        pricelist[i].gameId   = undefined;
      }
      let sortedPricelist = _.sortBy(pricelist, function (p) {
        return p.pricelist.position;
      });

      return callback(null, sortedPricelist);
    })
  },

  /**
   * Returns an array of the pricelist suitable as excel sheet
   * @param gameId
   * @param callback
   */
  getArray: function (gameId, callback) {
    logger.info(`${gameId}: Downloading pricelist array`);
    this.getPricelist(gameId, function (err, list) {
      if (err) {
        return callback(err);
      }

      gameplayModel.getGameplay(gameId, null, function (err, gp) {
        if (err) {
          return callback(err);
        }

        let csvList = [['Preisliste ' + gp.gamename], ['Position', 'Ort', 'Gruppe', 'Kaufpreis', 'Hauspreis', 'Miete', 'Miete 1H', 'Miete 2H', 'Miete 3H', 'Miete 4H', 'Miete Hotel']];
        for (let i = 0; i < list.length; i++) {
          let e = list[i];
          csvList.push([
            e.pricelist.position + 1,
            e.location.name,
            e.pricelist.propertyGroup,
            e.pricelist.price,
            e.pricelist.pricePerHouse,
            e.pricelist.rents.noHouse,
            e.pricelist.rents.oneHouse,
            e.pricelist.rents.twoHouses,
            e.pricelist.rents.threeHouses,
            e.pricelist.rents.fourHouses,
            e.pricelist.rents.hotel
          ]);
        }
        csvList.push(['Stand: ' + moment(gp.log.priceListCreated).format('D.M.YYYY') + ', Version: ' + gp.log.priceListVersion]);

        let fileName  = _.kebabCase(gp.gamename) + '-pricelist.xlsx';

        callback(null, {sheetName: 'Preisliste', fileName: fileName, data: csvList});
      });
    });
  }
};
