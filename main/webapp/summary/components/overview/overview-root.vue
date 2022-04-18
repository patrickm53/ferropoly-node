<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.04.22
-->
<template lang="pug">
  b-container(fluid)
    h1 Spielzusammenfassung
    b-row
      b-col
        p Das Ferropoly fand am {{gameDate | formatGameDate}} mit {{numberOfTeams}} teilnehmenden Teams statt.
        | Von den {{numberOfProperties}} Orten auf der Preisliste wurden {{numberOfBoughtProperties}} Orte gekauft, {{numberOfFreeProperties}} waren bei Spielende noch zu haben.
        | Insgesamt wurden {{numberOfBuiltHouses}} Häuser gebaut, pro verkauftem Grundstück sind dies im Schnitt {{numberOfHousesPerProperty | toFixed}}.
        | Die Bank registrierte 421 Buchungen für die Teams und weitere 80 Buchungen für Chance-Kanzlei.
        p Auf dieser Seite findest Du einen Rückblick auf dieses Spiel, dieser bleibt bis am 06.05.2022 verfügbar, dann werden sämtliche Daten zu diesem Spiel automatisch gelöscht.
        p Hat Dir das Spiel gefallen? Dann würde ich mich sehr darüber freuen, wenn Du es Deinen Freundinnen und Freunden weiter empfehlen würdest!
      b-col
        p Rangliste


</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatGameDate} from '../../../common/lib/formatters';

function toFixed(nb) {
  return nb.toFixed(1);
}
export default {
  name      : 'OverviewRoot',
  components: {},
  filters   : {formatGameDate, toFixed},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      gameDate : 'gameplay.scheduling.gameDate',
      menuElements   : 'summary.menuElements',
      panel          : 'summary.panel',
      error          : 'api.error',
    }),
    numberOfTeams() {
      return this.$store.getters['teams/numberOfTeams'];
    },
    numberOfProperties() {
      return this.$store.getters['propertyRegister/numberOfProperties'];
    },
    numberOfFreeProperties() {
      return this.$store.getters['propertyRegister/numberOfFreeProperties'];
    },
    numberOfBoughtProperties() {
      return this.$store.getters['propertyRegister/numberOfBoughtProperties'];
    },
    numberOfBuiltHouses() {
      return this.$store.getters['propertyRegister/numberOfBuiltHouses'];
    },
    numberOfHousesPerProperty() {
      return this.numberOfBuiltHouses / this.numberOfBoughtProperties;
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
