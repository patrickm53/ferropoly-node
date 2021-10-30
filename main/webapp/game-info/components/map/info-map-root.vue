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
          info-map
        b-col(sm="12" md="4")
          info-properties

</template>

<script>
import InfoMap from './info-map.vue';
import InfoProperties from './info-properties.vue'
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

    ]),
  },
  methods   : {},
  components: {InfoMap, InfoProperties},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
