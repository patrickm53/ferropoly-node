<!---
  Root element of the overview
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 17.12.21
-->
<template lang="pug">
  b-container(fluid)
    call-active-warning
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
import CallActiveWarning from '../call-active-warning.vue';

export default {
  name      : 'OverviewRoot',
  components: {GameInfo, RankingList, CallActiveWarning},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    gameIsNotActive() {
      return !this.$store.getters.gameIsActive();
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
