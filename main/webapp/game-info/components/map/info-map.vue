<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 30.10.21
-->
<template lang="pug">
  div
    ferropoly-map(:map-options="mapOptions")

</template>

<script>
import FerropolyMap from '../../../common/components/ferropoly-map/ferropoly-map.vue'
import geograph from '../../../../../../ferropoly_editor/editor/webapp/common/lib/geograph';
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
  computed  : {...mapFields([
      'gameplay.internal.finalized',
      'gameplay.internal.gameId',
      'pricelist',
      'map.center'
    ])},
  methods   : {},
  components: {FerropolyMap},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
