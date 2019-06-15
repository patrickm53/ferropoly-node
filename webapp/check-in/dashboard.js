const checkinDatastore = require('../../components/checkin-datastore/')
import ferropolySocket from './socket'
import geograph from './geograph'
import get from 'lodash/get'

/**
 * The dashboard controller
 * @param $scope
 */
function dashboardCtrl($scope) {
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
  geograph.onLocationChanged(function (position) {
    $scope.position = position;
    console.log(position);
    $scope.$apply();
  });


  if (!geograph.getLastLocation()) {
    geograph.localize();
  }

  // Chancellery Updates
  checkinDatastore.dataStore.subscribe('chancellery', function (data) {
    console.log('chancellery', data);
    $scope.chancelleryAsset = get(data, 'asset', 0);
    addTicker('Neuer Kontostand auf dem Parkplatz: ' + $scope.chancelleryAsset.toLocaleString('de-CH'));
    $scope.$apply();
  });

  // teamAccount Updates
  checkinDatastore.dataStore.subscribe('teamAccount', function (data) {
    console.log('teamAccount !!!!!!!!', data);
    $scope.teamAccount = data;
    if (data.transactions.length > 0) {
      let tr = data.transactions[data.transactions.length - 1];
      let amount = get(tr, 'transaction.amount', 0);
      addTicker('Kontobuchung ' + tr.transaction.info + ': ' + amount.toLocaleString('de-CH'));
    }
    $scope.$apply();
  });

  // properties Updates
  checkinDatastore.dataStore.subscribe('properties', function (data) {
    $scope.properties = data.properties;
    console.log('properties', data);
    $scope.$apply();
  });

  // Game info from general nature
  ferropolySocket.on('general', function (data) {
    console.info('General info data received', data);
    addTicker(data.message);
    $scope.$apply();
  });
}


const initDashboard = function (app) {
  app.controller('dashboardCtrl', dashboardCtrl);
  dashboardCtrl.$inject = ['$scope'];
};
export {initDashboard}
