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

}

checkinApp.controller('pricelistCtrl', pricelistCtrl);
propertiesCtrl.$inject = ['$scope'];

