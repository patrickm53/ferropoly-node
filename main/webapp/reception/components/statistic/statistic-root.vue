<!---
  Statistic root element
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.02.22
-->
<template lang="pug">
  div
    call-active-warning
    ferro-nav.mt-1(:elements="navBarElements" @nav-event="onNavEvent")
    statistic-asset(v-if="currentNavElement==='nav-asset'")
    statistic-asset-history(v-if="currentNavElement==='nav-asset-history'")
    statistic-income(v-if="currentNavElement==='nav-income'")
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import StatisticAsset from './statistic-asset.vue';
import StatisticAssetHistory from './statistic-asset-history.vue';
import StatisticIncome from './statistic-income.vue';
import FerroNav from '../../../common/components/ferro-nav/ferro-nav.vue';
import CallActiveWarning from '../call-active-warning.vue';

export default {
  name      : 'StatisticRoot',
  components: {CallActiveWarning, StatisticAsset, StatisticAssetHistory, StatisticIncome, FerroNav},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      navBarElements   : 'statistic.navBar',
      currentNavElement: 'statistic.currentNav'
    }),
  },
  created   : function () {
  },
  methods   : {
    onNavEvent(element) {
      this.currentNavElement = element;
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
