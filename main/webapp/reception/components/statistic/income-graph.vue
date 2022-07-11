<!---
  Graph displaying the income of each team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 21.02.22
-->
<template lang="pug">
  div(id="chart")
    apexchart#achart(type="bar" :height="height" :options="chartOptions" :series="chartData")
</template>

<script>
import {formatPrice} from '../../../common/lib/formatters';
import VueApexCharts from 'vue-apexcharts';
import {mapFields} from 'vuex-map-fields';
import {forOwn} from 'lodash';
import $ from 'jquery';

export default {
  name      : 'IncomeGraph',
  components: {
    apexchart: VueApexCharts,
  },
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      propertyRegister: 'propertyRegister.register',
      teams     : 'teams.list'
    }),
    chartData() {
      let dataset = {};
      // Init the working data set
      this.teams.forEach(t => {
        let rents = this.propertyRegister.evaluatePropertyValueForTeam(t.uuid);
        dataset[t.uuid] = {
          name     : t.data.name,
          current  : {x: t.data.name, y: rents.sum},
          potential: {x: t.data.name, y: rents.max - rents.sum}
        }
      });

      // Iterate through propertys and fill in the data
      let series = [
        {
          name: 'Aktueller Wert',
          data: []
        },
        {
          name: 'Mehrwert mit Hotels',
          data: []
        }
      ];
/*
      this.propertyRegister.properties.forEach(p => {
        let owner = p.gamedata.owner;
        if (owner) {
          let current = evaluateCurrentPropertyValue(p);
          dataset[owner].current.y += current;
          dataset[owner].potential.y += evaluatePropertyValue(p, 5) - current;
        }
      });*/

      forOwn(dataset, (value) => {
        series[0].data.push(value.current);
        series[1].data.push(value.potential);
      });
      return series;
    },
    chartOptions() {
      return {
        chart      : {
          type   : 'bar',
          stacked: true
        },
        plotOptions: {
          bar: {
            horizontal : false,
            columnWidth: '80%',
            endingShape: 'rounded'
          },
        },
        dataLabels : {
          enabled: false
        },
        stroke     : {
          show  : true,
          width : 2,
          colors: ['transparent']
        },
        yaxis     : {
          labels        : {
            formatter: formatPrice
          },
          tickAmount    : 10,
          forceNiceScale: true
        },
        tooltip    : {
          y: {
            formatter: function (val) {
              return formatPrice(val);
            }
          }
        }
      }
    },
    height() {
      return $(window).height() * 0.8;
    }
  },
  created   : function () {

  },
  destroyed() {

  },
  methods   : {
  }
}
</script>

<style lang="scss" scoped>

</style>
