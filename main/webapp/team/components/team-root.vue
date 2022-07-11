<!---
  Teams configuration page
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 27.11.21
-->
<template lang="pug">
  div
    menu-bar(
      :elements="menuElements"
      show-user-box=true
    )
    b-container(fluid)
      b-row
        b-col
          h1 Team Mitglieder
      b-row
        b-col
          p Hier kannst Du Deine Mitspieler*innen zum Team hinzufügen. Diese haben vollen Zugriff auf das Spiel, können aber keine weiteren Mitglieder einladen.
          p
            font-awesome-icon.important(:icon="['fas', 'exclamation-circle']")
            | &nbsp; WICHTIG: erfasse nur Personen, welche beim Spiel auch wirklich dabei sind: Die Position der Spieler wird während dem Spiel erfasst, es könnte sonst zu einem "Gruppe geteilt Alarm" in der Zentrale kommen.
      b-row
        b-col(sm="12" md="6")
          team-add
        b-col(sm="12" md="6")
          team-list


</template>

<script>
import MenuBar from '../../common/components/menu-bar/menu-bar.vue'
import TeamAdd from './team-add.vue';
import TeamList from './team-list.vue';
import {split} from 'lodash';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'team-root',
  props     : {},
  data      : function () {
    return {
      menuElements: [],
    };
  },
  model     : {},
  created   : function () {
    const elements = split(window.location.pathname, '/');
    this.gameId     = elements[elements.length - 2];
    this.teamId     = elements[elements.length - 1];
    this.$store.dispatch('fetchTeamMembers');
  },
  computed  : {
    ...mapFields([
      'teamId',
      'gameId'
    ])
  },
  methods   : {},
  components: {MenuBar, TeamAdd, TeamList},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>
.important {
  color: red;
}
</style>
