<!---
  Root element of the join app
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.11.21
-->
<template lang="pug">
  div
    menu-bar(:elements="menuElements"
      :show-user-box=false
    )
    game-not-found(v-if="showGameNotFoundPage")
    join-not-allowed(v-if="showNotAllowedPage")
    join-game(v-if="showJoiningPage")


</template>

<script>
import MenuBar from '../../common/components/menu-bar/menu-bar.vue';
import GameNotFound from './game-not-found.vue';
import JoinNotAllowed from './join-not-allowed.vue';
import JoinGame from './join-game.vue';
import {mapFields} from 'vuex-map-fields';
import {last, split} from 'lodash';

export default {
  name      : 'join-root',
  props     : {},
  data      : function () {
    return {
      menuElements: []
    };
  },
  model     : {},
  created   : function () {
    const elements = split(window.location.pathname, '/');
    let gameId     = last(elements);
    this.$store.dispatch('fetchData', {gameId});
  },
  computed  : {
    ...mapFields([
      'gameplay.joining.possibleUntil',
      'gameplay.joining.infotext'
    ]),
    showJoiningPage() {
      return true;
    },
    showGameNotFoundPage() {
      return false;
    },
    showNotAllowedPage() {
      return false;
    }
  },
  methods   : {},
  components: {MenuBar, GameNotFound, JoinNotAllowed, JoinGame},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
