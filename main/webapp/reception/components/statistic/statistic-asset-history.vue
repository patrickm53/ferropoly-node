<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.02.22
-->
<template lang="pug">
  div
    b-row
      b-col
        asset-history-graph
  
</template>

<script>
import AssetHistoryGraph from './asset-history-graph.vue';
export default {
  name: "StatisticAssetHistory",
  components: {AssetHistoryGraph},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {},
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
