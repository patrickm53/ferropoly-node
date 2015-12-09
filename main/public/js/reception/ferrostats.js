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

  c3.generate({
    bindto: '#stats-possessions-chart',
    size: {
      height: 400
    },
    data: {
      json: data,
      keys: {
        x: 'teamName',
        value: ['asset']
      },
      axes: {
        asset: 'y'
      },
      names: {
        asset: 'Vermögen'
      },
      type: 'bar',
      color: function (color, d) {
        // d will be 'id' when called for legends
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
      show: false
    }
  });
};

/**
 * Draw the chart for income
 * @param data
 * @param chartId
 */
FerroStats.prototype.drawIncomeChart = function (data, chartId) {
  console.log(data);
  c3.generate({
    bindto: '#stats-income-chart',
    size: {
      height: 400
    },
    data: {
      json: data,
      keys: {
        x: 'teamName',
        value: ['totalAmount']
      },
      axes: {
        asset: 'y'
      },
      names: {
        totalAmount: 'Einkommen'
      },
      type: 'bar',
      color: function (color, d) {
        // d will be 'id' when called for legends
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
      show: false
    }
  });
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
