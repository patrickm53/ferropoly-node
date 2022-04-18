<!---
  The overview for a game
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.04.22
-->
<template lang="pug">
  b-container(fluid)
    h1 Spielzusammenfassung "{{gameName}}"
    b-row
      b-col
        p Das Ferropoly fand am {{gameDate | formatGameDate}} mit {{numberOfTeams}} teilnehmenden Teams statt.
        | Von den {{numberOfProperties}} Orten auf der Preisliste wurden {{numberOfBoughtProperties}} Orte gekauft, {{numberOfFreeProperties}} waren bei Spielende noch zu haben.
        | Insgesamt wurden {{numberOfBuiltHouses}} Häuser gebaut, pro verkauftem Grundstück sind dies im Schnitt {{numberOfHousesPerProperty | toFixed}}.
        | Die Bank registrierte {{numberOfTeamAccountEntries}} Buchungen für die Teams und weitere {{numberOfChancelleryEntries}} Buchungen für Chance-Kanzlei.
        p Auf dieser Seite findest Du einen Rückblick auf dieses Spiel, dieser bleibt bis am {{deleteDate | formatGameDate}} verfügbar, dann werden sämtliche Daten zu diesem Spiel automatisch gelöscht.
        p Hat Dir das Spiel gefallen? Dann würde ich mich sehr darüber freuen, wenn Du es Deinen Freundinnen und Freunden weiter empfehlen würdest!
      b-col
        ferro-card(title="Rangliste")
          b-table(
            striped
            borderless
            hover
            small
            :items="rankingList"
            :fields="fields")
            template(#cell(name)="data")
              a(href="#" @click="onTeamSelected(data.item)") {{data.item.name}}
            template(#cell(asset)="data") {{data.item.asset | formatPrice}}


</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatGameDate, formatPrice} from '../../../common/lib/formatters';
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';

function toFixed(nb) {
  return nb.toFixed(1);
}

export default {
  name      : 'OverviewRoot',
  components: {FerroCard},
  filters   : {formatGameDate, toFixed, formatPrice},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      fields: [
        {key: 'rank', label: 'Rang'},
        {key: 'name', label: 'Team'},
        {key: 'asset', label: 'Vermögen'}
      ]
    };
  },
  computed  : {
    ...mapFields({
      gameDate    : 'gameplay.scheduling.gameDate',
      deleteDate  : 'gameplay.scheduling.deleteTs',
      gameName    : 'gameplay.gamename',
      menuElements: 'summary.menuElements',
      panel       : 'summary.panel',
      rankingList : 'rankingList.list',
      selectedTeamId: 'summary.selectedTeamId'
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
    },
    numberOfTeamAccountEntries() {
      return this.$store.getters['numberOfEntries'];
    },
    numberOfChancelleryEntries() {
      return this.$store.getters['chancellery/numberOfEntries'];
    }
  },
  created   : function () {
  },
  methods   : {
    onTeamSelected(team) {
      console.log('Team selected', team);
      this.selectedTeamId = team.teamId;
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
