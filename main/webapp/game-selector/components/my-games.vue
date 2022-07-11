<!---
  All my Games AS PLAYER

  9.4.2021 KC
-->
<template lang="pug">
  div(v-if="gameplays.length > 0")
    h1 Meine Spiele
    b-row(v-if="hasGames")
      b-col(v-for="gp in games" :key="gp.internal.gameId" xs="12" sm="12" md="6" lg="4" xl="4")
        game-card(:gameplay="gp")
    p(v-if="!hasGames") Du hast Dich noch zu keinem Spiel angemeldet.
</template>

<script>
import GameCard from './game-card.vue';

export default {
  name : 'my-games',
  props: {
    gameplays: {
      type   : Array,
      default: function () {
        return [];
      }
    }
  },
  data : function () {
    return {

    };
  },
  model: {},

  methods   : {},
  computed  : {
    games: function () {
      return this.gameplays;
    },
    hasGames: function() {
      return this.gameplays.length > 0;
    }
  },
  components: {GameCard}
}
</script>

<style scoped>

</style>
