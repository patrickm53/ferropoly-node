<!---
  Tab with the assets of a team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.02.22
-->
<template lang="pug">
  div
    b-row
      b-col(sm="4")
        asset-list.mt-1.ml-1(:list="list")
      b-col(sm="8")
        asset-graph.mt-1(:list="list")

</template>

<script>
import AssetList from './asset-list.vue';
import AssetGraph from './asset-graph.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'StatisticAsset',
  components: {AssetGraph, AssetList},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      list   : 'rankingList.list'
    }),
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
