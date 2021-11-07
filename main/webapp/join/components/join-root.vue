<!---
  Root element of the join app
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.11.21
-->
<template lang="pug">
  div
    menu-bar(:elements="menuElements"
      show-user-box=true
    )
    modal-error(
      :visible="apiErrorActive"
      title="Fehler"
      :info="apiErrorText"
      :message="apiErrorMessage"
      @close="apiErrorActive=false"
    )
    join-game


</template>

<script>
import MenuBar from '../../common/components/menu-bar/menu-bar.vue';
import ModalError from '../../common/components/modal-error/modal-error.vue';
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
    apiErrorActive : {
      get() {
        return this.$store.state.api.error.active;
      },
      set() {
        this.$store.commit('resetApiError');
      }
    },
    apiErrorText   : {
      get() {
        return this.$store.state.api.error.infoText;
      }
    },
    apiErrorMessage: {
      get() {
        return this.$store.state.api.error.message;
      }
    }
  },
  methods   : {},
  components: {MenuBar, JoinGame, ModalError},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
