/**
 *
 * Created by kc on 31.05.15.
 */
'use strict';

ferropolyApp.controller('ferrostatsCtrl', ferrostatsCtrl);
function ferrostatsCtrl($scope, $http) {
  $scope.rankingList = [];
  $scope.incomeList = [];

  /**
   * Show the income statistics
   */
  $scope.showStatsPossessions = function () {
    dataStore.getRankingList(function(err, list) {
      if (err) {
        console.log('Error while getting ranking list: ' + err.message);
        $scope.rankingList = [];
      }
      else {
        $scope.rankingList = _.sortBy(_.values(list), function (n) {
          return n.teamName;
        });
      }
      ferroStats.drawRankingChart($scope.rankingList, 'stats-possessions-chart');
      $scope.$apply();
      console.log('Ranking list received');
      console.log($scope.rankingList);
    });
  };
  $scope.teamIdToTeamName = dataStore.teamIdToTeamName;

  /**
   * Show stats income
   */
  $scope.showStatsIncome = function () {
    dataStore.getIncomeList(function(err, list) {
      if (err) {
        console.log('Error while getting income list: ' + err.message);
        $scope.incomeList = [];
      }
      else {
        $scope.incomeList = _.sortBy(_.values(list), function (n) {
          return n.teamName;
        });
      }
      ferroStats.drawIncomeChart($scope.incomeList, 'stats-income-chart');
      $scope.$apply();
      console.log('Ranking list received');
      console.log($scope.incomeList);
    });
  };

  /**
   * Show the details of one team
   * @param teamId
   */
  $scope.showIncomeDetails = function(teamId) {
    var entry = _.find($scope.incomeList, {'teamId': teamId});
    ferroStats.drawIncomeDetailChart(entry.register, 'stats-income-chart');
  };


  // Panels to be shown in the tabs. Initialize at the end of the controller, as the handlers
  // have to be initialized before
  $scope.panels = [
    {
      id: 'stats-possessions',
      handler: $scope.showStatsPossessions
    },
    {
      id: 'stats-income',
      handler: $scope.showStatsIncome
    }];

  /**
   * Show the correct panel for call management
   * @param panel
   */
  $scope.showStatsPanel = function (panel) {
    for (var i = 0; i < $scope.panels.length; i++) {
      $('#' + $scope.panels[i].id).hide().removeClass('active');
      if ($scope.panels[i].id === panel) {
        $scope.panels[i].handler();
      }
    }
    $('#' + panel).show();
    $('#tab-' + panel).addClass('active');

  };

  // Set the startup panel
  $scope.showStatsPanel('stats-possessions');
};

ferrostatsCtrl.$inject = ['$scope', '$http'];

