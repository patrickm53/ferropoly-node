/**
 * The checkin app
 */
import $ from 'jquery'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'angular';
import isNumber from 'lodash/isNumber'

import {library, dom} from "@fortawesome/fontawesome-svg-core";
import {faCircle} from "@fortawesome/free-solid-svg-icons/faCircle";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import {faExclamationCircle} from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import {faDownload} from "@fortawesome/free-solid-svg-icons/faDownload";
import {faCheck} from "@fortawesome/free-solid-svg-icons/faCheck";


library.add(faCircle, faCheckCircle, faCheck);
library.add(faExclamationCircle, faDownload);
dom.watch();


/**
 * The ferropoly app object for the angular controllers
 * @type {*|module}
 */
const checkinApp = angular.module('checkinApp', []);
/**
 * This is the amount filter returning nicer values
 */
checkinApp.filter('amount', function () {
  return function (val) {
    if (isNumber(val)) {
      return val.toLocaleString('de-CH');
    }
    return val;
  }
});

/**
 * The dashboard controller
 * @param $scope
 * @param $http
 */
function dashboardCtrl($scope, $http) {
  // Initializing
  $(document).ready(() => {
    console.log('Index page intitialized');

  });
}

checkinApp.controller('dashboardCtrl', dashboardCtrl);
dashboardCtrl.$inject = ['$scope', '$http'];


