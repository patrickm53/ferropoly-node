/**
 * Traffic information
 * Created by kc on 01.09.15.
 */
'use strict';

ferropolyApp.controller('trafficCtrl', trafficCtrl);
function trafficCtrl($scope) {
  var rssFeed = {
    'sbb': 'http://fahrplan.sbb.ch/bin//help.exe/dnl?tpl=rss_feed_custom&icons=46&regions=BVI1,BVI2,BVI3,BVI4,BVI5',
    'zvv': 'http://fahrplan.sbb.ch/bin//help.exe/dnl?tpl=rss_feed_custom&icons=46&regions=BVI4'
  };

  $scope.loadActualTrafficSituation = function (callback) {
    $.get(rssFeed['sbb'], function (data) {
      console.log(data);
    })
      .fail(function (data) {
        console.error('ERROR when getting RSS Feed:');
        console.log(data);
      })
      .always(function () {
        if (callback) {
          callback();
        }
        $scope.$apply();
        _.delay($scope.loadActualTrafficSituation, 60000);
      })
  };

 // $scope.loadActualTrafficSituation();
  $scope.test = 'ABC';
}

trafficCtrl.$inject = ['$scope'];

