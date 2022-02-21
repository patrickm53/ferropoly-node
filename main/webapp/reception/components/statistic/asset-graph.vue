<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 20.02.22
-->
<template lang="pug">
  div(id="chart")
    apexchart(type="bar"  :options="chartOptions" :series="chartData")
</template>

<script>
import VueApexCharts from 'vue-apexcharts';
import {sortBy} from 'lodash';
import {formatPrice} from '../../../common/lib/formatters';

export default {
  name      : 'AssetGraph',
  components: {
    apexchart: VueApexCharts,
  },
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    list: {
      type   : Array,
      default: () => {
        return [];
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {
    chartData() {
      let data = [];
      sortBy(this.list, 'name').forEach(e => {
        data.push({
          x          : e.name,
          y          : e.asset,
          fillColor  : this.$store.getters.teamColor(e.teamId),
          strokeColor: this.$store.getters.teamColor(e.teamId)
        });
      })
      return [{
        name: 'Vermögen',
        data: data
      }];
    },
    chartOptions() {
      return {
        chart      : {
          type: 'bar',
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
        yaxis      : {
          labels        : {
            formatter: formatPrice
          },
          tickAmount    : 10,
          forceNiceScale: true
        },
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
