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


function dashboardCtrl($scope, $http) {
  $scope.chancelleryAsset = 0;


  checkinDatastore.dataStore.subscribe('chancellery', function (data) {
    console.log(data);
    $scope.chancelleryAsset = data.asset;
    $scope.$apply();

  });
}

checkinApp.controller('dashboardCtrl', dashboardCtrl);
dashboardCtrl.$inject = ['$scope', '$http'];

