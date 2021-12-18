<!---
  Info card about the game
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 17.12.21
-->
<template lang="pug">
  div
    ferro-card(title="Spielinfo")
      b-table-simple(small)
        b-tbody
          b-tr
            b-td Spieldatum
            b-td {{gameDate | formatGameDate}}
          b-tr
            b-td Spielstart
            b-td {{gameStart | formatGameTime}}
          b-tr
            b-td Spielende
            b-td {{gameEnd | formatGameTime}}
          b-tr
            b-td Dauer einer Spielrunde
            b-td {{interestInterval}} min
          b-tr
            b-td Startgeld pro Runde
            b-td {{interest | formatPrice}}
          b-tr
            b-td Guthaben zu Spielbeginn
            b-td {{startCapital | formatPrice}}
          b-tr
            b-td Zinsrunden bei Spielende
            b-td {{interestCyclesAtEndOfGame}}
          b-tr
            b-td Strafzins bei negativem Vermögen
            b-td {{debtInterest}} %

</template>

<script>
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';
import {mapFields} from 'vuex-map-fields';
import {formatGameDate, formatGameTime, formatPrice} from '../../../common/lib/formatters';

export default {
  name      : 'GameInfo',
  components: {FerroCard},
  filters   : {formatGameDate, formatGameTime, formatPrice},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      gameDate                 : 'gameplay.scheduling.gameDate',
      gameStart                : 'gameplay.scheduling.gameStart',
      gameEnd                  : 'gameplay.scheduling.gameEnd',
      interestInterval         : 'gameplay.gameParams.interestInterval',
      interest                 : 'gameplay.gameParams.interest',
      startCapital             : 'gameplay.gameParams.startCapital',
      interestCyclesAtEndOfGame: 'gameplay.gameParams.interestCyclesAtEndOfGame',
      debtInterest             : 'gameplay.gameParams.debtInterest',
    })
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
