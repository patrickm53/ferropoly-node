/**
 * The account controller
 * Created by kc on  02.04.16.
 */

const checkinDatastore = require('../../components/checkin-datastore/')


/**
 * The Checkin teams account controller
 * @param $scope
 * @param $http
 */
function teamAccountCtrl($scope, $http) {

  $scope.transactions = [];

  // account updates
  checkinDatastore.dataStore.subscribe('teamAccount', function (data) {
    $scope.transactions = data.transactions;
    console.log($scope.transactions);
    $scope.$apply();
  });
}


const initAccounts = function (app) {
  app.controller('checkinAccountCtrl', teamAccountCtrl);
  teamAccountCtrl.$inject = ['$scope'];
};
export {initAccounts}
