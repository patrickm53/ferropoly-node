<!--
  The TOP-Tag of the game selector

  11.4.2021 KC
-->
<template lang="pug">
  #game-selector
    modal-agb()
    menu-bar(:elements-right="menuElementsRight" show-user-box=true)
    welcome-bar(:user-name="userDisplayName")
    b-container(fluid=true)
      b-row
        b-col
          p.intro In dieser App kannst Du deine im Editor erstellten Spiele anschauen und in das Geschehen eines Deiner aktuellen Spiele eingreifen. Weitere Infos findest Du auf der&nbsp;
            a(href='http://www.ferropoly.ch' target='blank') Ferropoly Webseite
            | .
      b-row
        b-col
          p(v-if="noGamesAtAll") Du hast Dich noch an keinem Spiel angemeldet und auch keines selbst erstellt. Sobald Du angemeldet bist oder selbst ein Spiel erstellt hast, dann erscheinen diese Spiele hier.
          my-gameplays(:gameplays="gameplays")
          my-games(:gameplays="games")
</template>

<script>
import WelcomeBar from './welcome-bar.vue'
import MyGames from './my-games.vue'
import MyGameplays from './my-gameplays.vue'
import ModalAgb from '../../common/components/modal-agb/modal-agb.vue';
import MenuBar from '../../common/components/menu-bar/menu-bar.vue'
import {mapFields} from 'vuex-map-fields';

export default {
  name : 'GameSelector',
  components: {WelcomeBar, MyGames, ModalAgb, MenuBar, MyGameplays}
  model: {},
  props: [],
  data : function () {
    return {

      menuElementsRight:
          [
            {title: 'Hilfe / Info', href: '/about', hide: false},
            {title: 'Admin Dashboard', href: '/dashboard', hide: true}
          ]
    };
  },
  created() {
    this.$store.dispatch('fetchGames');
    this.$store.dispatch('fetchUserData');
  },
  mounted() {
  },
  // eslint-disable-next-line vue/order-in-components
  computed  : {
    ...mapFields([
      'games',
      'gameplays',
      'userDisplayName'
    ]),
    noGamesAtAll() {
      return ((this.games.length === 0) && (this.gameplays.length === 0));
    }
  },
  methods   : {},
}
</script>

<style scoped>

</style>
