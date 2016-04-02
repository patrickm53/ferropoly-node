/**
 * The account controller
 * Created by kc on 02.04.16.
 */

'use strict';

function checkinAccountController($scope, $http) {

  $scope.transactions = [];
  
  // account updates
  checkinDatastore.dataStore.subscribe('teamAccount', function (data) {
    $scope.transactions = data.transactions;
    console.log($scope.transactions);
    $scope.$apply();
  });
}
checkinApp.controller('checkinAccountCtrl', checkinAccountController);
checkinAccountController.$inject = ['$scope', '$http'];

