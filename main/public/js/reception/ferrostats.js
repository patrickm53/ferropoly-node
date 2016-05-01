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
 * Draw the chart for possession over the time
 * @param data all accounts data
 * @param teams the teams data
 */
FerroStats.prototype.drawPossessionTimelineChart = function (data, teams) {
  var chartData = {};
  // This special chart can't be created as the other ones (at least I haven't find out how): create the datasets as
  // required for c3/d3
  // See: http://c3js.org/samples/simple_xy_multiple.html

  // Prepare the objects
  for (var i = 0; i < teams.length; i++) {
    chartData[teams[i].uuid] = {};
    chartData[teams[i].uuid].ts = [teams[i].uuid + ':x'];
    chartData[teams[i].uuid].values = [teams[i].uuid];
  }

  // Now iterate through the data
  for (i = 0; i < data.length; i++) {
    chartData[data[i].teamId].ts.push(new Date(data[i].timestamp));
    chartData[data[i].teamId].values.push(data[i].balance);
  }

  // Create the data object expected by c3
  var c3Data = {
    xs: {},
    columns: [],
    names: {},
    color: function (color, d) {
      if (d.id) {
        return dataStore.getTeamColor(d.id)
      }
      return (dataStore.getTeamColor(d));
    },
    type: 'step'
  };
  for (i = 0; i < teams.length; i++) {
    c3Data.xs[teams[i].uuid] = teams[i].uuid + ':x';
    c3Data.columns.push(chartData[data[i].teamId].ts);
    c3Data.columns.push(chartData[data[i].teamId].values);
    c3Data.names[teams[i].uuid] = dataStore.teamIdToTeamName(teams[i].uuid);
  }

  c3.generate({
    bindto: '#stats-possession-timeline-chart',
    size: {
      height: 500
    },
    data: c3Data,
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%H:%M:%S'
        }
      }
    },
    grid: {
      y: {
        show: true
      }
    },
    zoom: {
      enabled: true
    },
    subchart: {
      show: true
    }
  });
};


/**
 * Draw the income detail chart for one team (pie chart)
 * @param register
 * @param chartId
 */
FerroStats.prototype.drawIncomeDetailChart = function (register, chartId) {

  // Transform data first for pie charts
  var data = [];
  for (var i = 0; i < register.length; i++) {
    data.push([register[i].propertyName, register[i].amount]);
  }

  c3.generate({
    bindto: '#stats-income-chart',
    size: {
      height: 400
    },
    data: {
      columns: data,
      type: 'pie'
    },
    legend: {
      show: true,
      position: 'inset'
    }
  });

};
var ferroStats = new FerroStats();
