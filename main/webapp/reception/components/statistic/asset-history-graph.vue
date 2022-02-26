<!---
  Graph with complete history
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 21.02.22
-->
<template lang="pug">
  div
    div(id="chart")
      apexchart#achart(type="line" :height="height" :options="chartOptions" :series="chartData")

</template>

<script>
import {mapFields} from 'vuex-map-fields';
import $ from 'jquery';
import VueApexCharts from 'vue-apexcharts';
import {getTeamColorArray} from '../../lib/teamLib';
import {DateTime} from 'luxon';
import {formatPrice} from '../../../common/lib/formatters';

export default {
  name      : 'AssetHistoryGraph',
  components: {apexchart: VueApexCharts},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      teams: 'teams.list'
    }),
    chartData() {
      let series = [];
      this.teams.forEach(t => {
        let se  = {
          name: t.data.name,
          data: []
        }
        let tac = this.$store.getters.teamAccountData(t.uuid);
        tac.forEach(tacEntry => {
          se.data.push({x: tacEntry.timestamp, y: tacEntry.balance})
        });
        series.push(se);
      });
      return series;
    },
    chartOptions() {
      return {
        chart     : {
          type   : 'line',
          height : 350,
          zoom   : {
            enabled       : true,
            type          : 'xy',
            autoScaleYaxis: false,
          },
          toolbar: {
            autoSelected: 'zoom'
          },
        },
        colors    : getTeamColorArray(),
        stroke    : {
          curve: 'stepline',
          width: 0.9,
        },
        dataLabels: {
          enabled: false
        },
        markers   : {
          hover: {
            sizeOffset: 4
          }
        },
        xaxis     : {
          type   : 'datetime',
          tooltip: {
            formatter: function (val) {
              return DateTime.fromMillis(val).toLocaleString(DateTime.TIME_24_WITH_SECONDS);
            }
          },
          labels : {
            datetimeUTC: false
          }
        },
        yaxis     : {
          labels        : {
            formatter: formatPrice
          },
          tickAmount    : 10,
          forceNiceScale: true
        },
        tooltip   : {
          y: {
            formatter: formatPrice
          }
        }
      };
    },
    height() {
      return $(window).height() * 0.8;
    }
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
