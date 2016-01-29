/**
 * Dashboard controller
 * Created by kc on 14.01.16.
 */

'use strict';

$(document).ready(function () {
  // Make all elements the same height using jquery
  var boxes     = $('.dashboard-tile');
  var maxHeight = Math.max.apply(
    Math, boxes.map(function () {
      return $(this).height();
    }).get());
  boxes.height(maxHeight);
});

/**
 * The dashboard controller
 * @param $scope
 * @param $http
 */
function dashboardCtrl($scope, $http) {
  $scope.chancelleryAsset = 0;
  $scope.properties       = [];
  $scope.liveTicker       = [];
  $scope.team             = ferropoly.team; // Supplied in HEAD

  /**
   * The live ticker formatter
   * @param message
   */
  function addTicker(message) {
    $scope.liveTicker.push({ts: new Date(), message: message});
  }

  // Geo location, tests so far only
  geograph.onLocationChanged(function(position) {
    $scope.position = position;
    console.log(position);
    $scope.$apply();
  });


  if (!geograph.getLastLocation()) {
    geograph.localize();
  }

  // Chancellery Updates
  checkinDatastore.dataStore.subscribe('chancellery', function (data) {
    console.log(data);
    $scope.chancelleryAsset = data.asset;
    addTicker('Neuer Kontostand auf dem Parkplatz: ' + data.asset);
    $scope.$apply();
  });

  // teamAccount Updates
  checkinDatastore.dataStore.subscribe('teamAccount', function (data) {
    $scope.teamAccount = data;
    if (data.transactions.length > 0) {
      var tr = data.transactions[data.transactions.length - 1];
      addTicker('Kontobuchung ' + tr.transaction.info + ': ' + tr.transaction.amount);
    }
    $scope.$apply();
  });

  // properties Updates
  checkinDatastore.dataStore.subscribe('properties', function (data) {
    $scope.properties = data.properties;
    console.log('properties', data);
    $scope.$apply();
  });
}

checkinApp.controller('dashboardCtrl', dashboardCtrl);
dashboardCtrl.$inject = ['$scope', '$http'];

