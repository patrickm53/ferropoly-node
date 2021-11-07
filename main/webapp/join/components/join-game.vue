<!---
  Join the game
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.11.21
-->
<template lang="pug">
  div
    b-container(fluid)
      b-row
        b-col(sm="6")
          h1 {{gamename}}
          h3(v-if="organisation") {{organisation}}
          div(v-html="infotext")
          h4 Spieldaten
          b-row
            b-col(sm="4") Datum
            b-col(sm="8") {{gameDate | formatGameDate}}
          b-row
            b-col(sm="4")
            b-col(sm="8") {{gameStart | formatGameTime}} - {{gameEnd | formatGameTime}}
          h4 Kontakt
          b-row
            b-col(sm="4") Name
            b-col(sm="8") {{organisatorName}}
          b-row
            b-col(sm="4") Email
            b-col(sm="8")
              a(:href="organisatorEmail") {{organisatorEmail}}
          b-row
            b-col(sm="4") Telefonnummer
            b-col(sm="8") {{organisatorPhone}}

        b-col(sm="6")
          team-new(v-if="!teamExists")
          team-info(v-if="teamExists")


</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatGameDate, formatGameTime} from '../../common/lib/formatters';
import TeamNew from './team/team-new.vue';
import TeamInfo from './team/team-info.vue';

export default {
  name      : 'join-game',
  props     : {},
  data      : function () {
    return {};
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    ...mapFields([
      'gameplay.gamename',
      'gameplay.owner.organisation',
      'gameplay.owner.organisatorName',
      'gameplay.owner.organisatorEmail',
      'gameplay.owner.organisatorPhone',
      'gameplay.joining.infotext',
      'gameplay.scheduling.gameDate',
      'gameplay.scheduling.gameStart',
      'gameplay.scheduling.gameEnd',
      'teamInfo.id'
    ]),
    teamExists() {
      if (!this.id) {
        return false;
      }
      return this.id.length > 0;
    }
  },
  methods   : {},
  components: {TeamNew, TeamInfo},
  filters   : {formatGameDate, formatGameTime},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
