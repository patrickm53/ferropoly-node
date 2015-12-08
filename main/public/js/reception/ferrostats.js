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
};


/**
 * Draw the income chart
 * @param data
 * @param chartId
 */
FerroStats.prototype.drawRankingChart = function (data, chartId) {

  console.log(data);

  c3.generate({
    bindto: '#stats-possessions-chart',
    size: {
      height: 400
    },
    data: {
      json: data,
      keys: {
        x: 'teamName',
        value: ['asset'],
        axes: {
          asset: 'y'
        },
        names: {
          asset: 'Vermoegen'
        }
      },
      type: 'bar',
      color: function (color, d) {
        // d will be 'id' when called for legends
        console.log('color', color);
        console.log('d', d);
        if (_.isNumber(d.x)) {
          return dataStore.getTeamColor(data[d.x].teamId)
        }
        return 'blue';
      }
    },
    axis: {
      x: {
        type: 'category'
      }
    },
    grid: {
      y: {
        show: true
      }
    },
    legend: {
      show: true
    }
  });
};

/**
 * Draw the chart for income
 * @param data
 * @param chartId
 */
FerroStats.prototype.drawIncomeChart = function (data, chartId) {
  return;
  if (!this.graphApiAvailable) {
    console.warn('graphApi not available');
    return;
  }

  var chartData = new google.visualization.DataTable();
  chartData.addColumn('string', 'Team');
  chartData.addColumn('number', 'Einkommen');
  chartData.addColumn({type: 'string', role: 'style'});

  var maxValue = 0;
  for (var i = 0; i < data.length; i++) {
    chartData.addRow([data[i].teamName, data[i].totalAmount, dataStore.getTeamColor(data[i].teamId)]);
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
  return;
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
