<!--
  - Copyright (c) 2021 Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  -->

<!---
  Root element of the overview
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 17.12.21
-->
<template lang="pug">
  b-container(fluid)
    b-row
      b-col
        h1 Übersicht
    b-row
      b-col
        ranking-list
      b-col
        game-info

  
</template>

<script>
import GameInfo from './gameInfo.vue';
import RankingList from './rankingList.vue';
export default {
  name: "OverviewRoot",
  components: {GameInfo, RankingList},
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
