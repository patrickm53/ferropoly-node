/**
 * Statistics and graphs
 * Created by kc on 31.05.15.
 */
'use strict';

/***
 * Constructor
 * @constructor
 */
var FerroStats = function () {
  var self = this;
  this.graphApiAvailable = false;
};

/**
 * Load the charts api
 */
FerroStats.prototype.loadChartApi = function() {
  var self = this;
  if (this.graphApiAvailable) {
    return;
  }
  /**
   * Called, when the graph api was loaded
   */
  function onGraphApiLoaded() {
    console.log('Google Grap API loaded');
    self.graphApiAvailable = true;
    console.log('showing #stats-main');
    $('#stats-load-error').hide();
    $('#stats-main').show();
  }

  console.log('retrieving jsapi');
  $.getScript("https://www.google.com/jsapi")
    .done(function (script, textStatus) {
      console.log('jsapi loaded, now loading chart api');
      google.load('visualization', '1.0', {'packages': ['corechart'], callback: onGraphApiLoaded});
    })
    .fail(function (jqxhr, settings, exception) {
      console.log("Triggered ajaxError handler.");
      console.log(exception);
    });
};
/**
 * Draw the income chart
 * @param data
 * @param chartId
 */
FerroStats.prototype.drawRankingChart = function (data, chartId) {
  if (!this.graphApiAvailable) {
    console.warn('graphApi not available');
    return;
  }

  var chartData = new google.visualization.DataTable();
  chartData.addColumn('string', 'Team');
  chartData.addColumn('number', 'Vermögen');

  var maxValue = 0;
  for (var i = 0; i < data.length; i++) {
    chartData.addRow([data[i].teamName, data[i].asset]);
    if (data[i].asset > maxValue) {
      maxValue = data[i].asset;
    }
  }

  maxValue *= 1.1;

  var options = {
    title: 'Vermögen',
    curveType: 'function',
    legend: {position: 'none'},
    height: 600,
    backgroundColor: {fill: 'transparent'}, // undocumented google feature...
    vAxis: {minValue: 0, maxValue: maxValue, gridlines: {count: 10}}
  };

  var chart = new google.visualization.ColumnChart(document.getElementById(chartId));
  chart.draw(chartData, options);
};

/**
 * Draw the chart for income
 * @param data
 * @param chartId
 */
FerroStats.prototype.drawIncomeChart = function (data, chartId) {
  if (!this.graphApiAvailable) {
    console.warn('graphApi not available');
    return;
  }

  var chartData = new google.visualization.DataTable();
  chartData.addColumn('string', 'Team');
  chartData.addColumn('number', 'Einkommen');

  var maxValue = 0;
  for (var i = 0; i < data.length; i++) {
    chartData.addRow([data[i].teamName, data[i].totalAmount]);
    if (data[i].totalAmount > maxValue) {
      maxValue = data[i].totalAmount;
    }
  }

  maxValue *= 1.1;

  var options = {
    title: 'Einkommen (Miete)',
    curveType: 'function',
    legend: {position: 'none'},
    height: 600,
    backgroundColor: {fill: 'transparent'}, // undocumented google feature...
    vAxis: {minValue: 0, maxValue: maxValue, gridlines: {count: 10}}
  };

  var chart = new google.visualization.ColumnChart(document.getElementById(chartId));
  chart.draw(chartData, options);
};

/**
 * Draw the income detail chart for one team (pie chart)
 * @param register
 * @param chartId
 */
FerroStats.prototype.drawIncomeDetailChart = function (register, chartId) {
  var dataArray = [['Ort', 'Einkommen']];
  register = _.sortBy(register, function (n) {
    return n.amount * (-1);
  });
  for (var i = 0; i < register.length; i++) {
    dataArray.push([register[i].propertyName, register[i].amount]);
  }
  var data = google.visualization.arrayToDataTable(dataArray);
  var options = {
    title: 'Einkommensquellen',
    height: 600,
    backgroundColor: {fill: 'transparent'}
  };
  var chart = new google.visualization.PieChart(document.getElementById(chartId));
  chart.draw(data, options);
};
var ferroStats = new FerroStats();

/**
 * Initialisations of the statistics part to be done when document is ready
 */
$(document).ready(function () {
  console.log('hiding #stats-main');
  $('#stats-load-error').show();
  $('#stats-main').hide();
  ferroStats.loadChartApi();
});
