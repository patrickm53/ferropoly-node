<!---
  Card with the basic game info
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.10.21
-->
<template lang="pug">
  div
    ferro-card(title="Spielinfo")
      b-row
        b-col Spieldatum
        b-col {{gameDate | formatGameDate}}
      b-row
        b-col Startzeit
        b-col {{gameStart | formatGameTime}}
      b-row
        b-col Spielende
        b-col {{gameEnd | formatGameTime}}
      b-row
        b-col Spielleitung
        b-col {{org}}
      b-row
        b-col Email
        b-col
          a(:href="mailUrl") {{organisatorEmail}}
      b-row
        b-col Telefon während Spiel
        b-col {{organisatorPhone}}
</template>

<script>
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue'
import {mapFields} from 'vuex-map-fields';
import {formatGameDate, formatGameTime} from '../../../common/lib/formatters';

export default {
  name      : 'BasicGameinfo',
  components: {FerroCard},
  filters   : {formatGameDate, formatGameTime},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields([
      'gameplay.scheduling.gameDate',
      'gameplay.scheduling.gameStart',
      'gameplay.scheduling.gameEnd',
      'gameplay.owner.organisatorName',
      'gameplay.owner.organisation',
      'gameplay.owner.organisatorPhone',
      'gameplay.owner.organisatorEmail',
    ]),
    org() {
      if (this.organisation && this.organisation.length > 0) {
        return `${this.organisation} (${this.organisatorName})`;
      }
      return this.organisatorName;
    },
    mailUrl() {
      return `mailto:${this.organisatorEmail}`;
    }
  },
  created   : function () {
  },
  methods   : {},
}
</script>

<style lang="scss" scoped>

</style>
