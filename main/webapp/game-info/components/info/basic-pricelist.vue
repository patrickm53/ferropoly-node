<!---
  Card with the pricelist
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.10.21
-->
<template lang="pug">
  div
    ferro-card(title="Preisliste")
      div(v-if="finalized")
        p Die Preisliste enthält {{pricelistLength}} Orte und kann unter dem Menupunkt "Preisliste" angeschaut oder
          a(:href='downloadUrl') &nbsp;hier als Excel-Datei&nbsp;
          | geladen werden.
      div(v-if="!finalized")
        p Die Preisliste ist noch in Bearbeitung. Sobald sie fertig ist, kannst Du sie hier anschauen.

</template>

<script>
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'BasicPricelist',
  components: {FerroCard},
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      finalized: 'gameplay.internal.finalized',
      gameId   : 'gameplay.internal.gameId',
      pricelist: 'register.properties'
    }),
    pricelistLength() {
      return this.pricelist.length;
    },
    downloadUrl() {
      return `/info/${this.gameId}/download`
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
