<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 30.10.21
-->
<template lang="pug">
  div
    ferropoly-map(
      ref="map"
      :map-options="mapOptions"
      @map="onNewMap")

</template>

<script>
import FerropolyMap from '../../../common/components/ferropoly-map/ferropoly-map.vue'
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'info-map',
  props     : {},
  data      : function () {
    return {
      mapOptions: {
        center: this.center,
        zoom  : 10
      }
    };
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    ...mapFields([
      'gameplay.internal.finalized',
      'gameplay.internal.gameId',
      'pricelist',
      'mapSettings.center',
      'map'
    ])
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
  },
  components: {FerropolyMap},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
