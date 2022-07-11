<!---
  All my Games AS ADMIN
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.10.21
-->
<template lang="pug">
  div(v-if="gameplays.length > 0")
    h1 Meine Spiele als Admin
    b-row
      b-col(v-for="gp in games" :key="gp.internal.gameId" xs="12" sm="12" md="6" lg="4" xl="4")
        gameplay-card(:gameplay="gp")

</template>

<script>
import GameplayCard from './gameplay-card.vue';
export default {
  name      : 'my-gameplays',
  props     : {
    gameplays: {
      type   : Array,
      default: function () {
        return [];
      }
    }
  },
  data      : function () {
    return {};
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    games: function () {
      return this.gameplays;
    }
  },
  methods   : {},
  components: {GameplayCard},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
