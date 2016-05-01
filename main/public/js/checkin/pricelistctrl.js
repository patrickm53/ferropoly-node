/**
 * Pricelist controller for the checkin
 * Created by kc on 27.01.16.
 */

'use strict';

/**
 * The pricelist controller
 * @param $scope
 * @param $http
 */
function pricelistCtrl($scope) {
  $scope.pricelist = ferropoly.pricelist;

  // properties Updates
  checkinDatastore.dataStore.subscribe('properties', function (data) {
    var props = data.properties;
    for (var i = 0; i < props.length; i++) {
      var entry = _.find($scope.pricelist, {uuid: props[i].uuid});
      if (entry) {
        console.log('Updating Entry', entry);
        entry.gamedata = props[i].gamedata;
      }
    }
    $scope.$apply();
  });
}

checkinApp.controller('pricelistCtrl', pricelistCtrl);
propertiesCtrl.$inject = ['$scope'];

