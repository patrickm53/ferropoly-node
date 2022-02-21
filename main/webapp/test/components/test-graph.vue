<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 21.02.22
-->
<template lang="pug">
  div(id="chart")
    apexchart(type="bar" height="350" :options="chartOptions" :series="chartData")


</template>

<script>
import {formatPrice} from '../../common/lib/formatters';
import VueApexCharts from 'vue-apexcharts';

export default {
  name      : 'TestGraph',
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
    chartData() {
      let series  = [{
        name: 'Aktueller Wert',
        data: [{x: 'a', y: 15}, {x: 'b', y: 10}, {x: 'c', y: 20}]
      }, {
        name: 'Potentieller Wert',
        data: [{x: 'a', y: 0}, {x: 'c', y: 5}, {x: 'b', y: 2}]
      },
      ];


      return series;
    },
    chartOptions() {
      return {
        chart      : {
          type   : 'bar',
          height : 350,
          stacked: true

        },
        plotOptions: {
          bar: {
            horizontal : false,
            columnWidth: '55%',
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
        yaxis      : {},
        fill       : {
          opacity: 1
        },
        tooltip    : {
          y: {
            formatter: function (val) {
              return formatPrice(val);
            }
          }
        }
      }
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
