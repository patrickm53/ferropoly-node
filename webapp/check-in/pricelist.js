/**
 * Pricelist controller for the checkin
 * Created by kc on 27.01.16.
 */

import find from 'lodash/find'
const checkinDatastore = require('../../components/checkin-datastore/')

/**
 * The pricelist controller
 * @param $scope
 */
function pricelistCtrl($scope) {
  $scope.pricelist = ferropoly.pricelist;

  // properties Updates
  checkinDatastore.dataStore.subscribe('properties', function (data) {
    let props = data.properties;
    for (var i = 0; i < props.length; i++) {
      let entry = find($scope.pricelist, {uuid: props[i].uuid});
      if (entry) {
        console.log('Updating Entry', entry);
        entry.gamedata = props[i].gamedata;
      }
    }
    $scope.$apply();
  });
}



const initPricelist = function (app) {
  app.controller('pricelistCtrl', pricelistCtrl);
  pricelistCtrl.$inject = ['$scope'];
};
export {initPricelist}
