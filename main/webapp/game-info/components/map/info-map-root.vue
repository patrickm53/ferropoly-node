<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.10.21
-->
<template lang="pug">
  div
    div(v-if="!finalized")
      b-jumbotron(:header="gamename" lead="Die Preisliste für dieses Spiel ist noch nicht fertig erstellt. Komme später wieder vorbei!" )
      p &nbsp;
    div(v-if="finalized")
      b-row
        b-col(sm="12" md="8")
          ferropoly-map(
            ref="map"
            :map-options="mapOptions"
            @map="onNewMap")
        b-col(sm="12" md="4")
          info-properties(@property-selected="propertySelected")

</template>

<script>

import InfoProperties from './info-properties.vue'
import FerropolyMap from '../../../common/components/ferropoly-map/ferropoly-map.vue'
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'info-map-root',
  props     : {},
  data      : function () {
    return {};
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    ...mapFields([
      'gameplay.internal.finalized',
      'gameplay.internal.gameId',
      'pricelist',
      'mapOptions',
      'map'
    ]),
  },
  methods   : {
    /**
     * A new map instance was created, we're using this one now
     */
    onNewMap(map) {
      console.log('new Map!', map);
      this.map = map;
      this.$store.dispatch({type: 'updateMarkers'});
    },
    /**
     * A Property was selected
     */
    propertySelected(p) {
      this.$store.dispatch({type: 'selectProperty', property: p});
      this.$refs.map.setFocusOnProperty(p);
    },
  },
  components: { InfoProperties, FerropolyMap},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
