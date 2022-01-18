<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.01.22
-->
<template lang="pug">
  div
    b-row
      b-col(sm="6")
        ferro-card(title="Liegenschaft kaufen" size="sm")
          property-selector(:properties="properties" per-page="8")
      b-col(sm="6")
        b-row
          b-col(sm="6")
            ferro-card(title="Häuserbau" size="sm")
              b-button Überall Häuser bauen
              p Zur Besitzliste um einzelne Häuser zu bauen
          b-col(sm="6")
            ferro-card(title="Gambling" size="sm")
              gambling-controls
        b-row
          b-col(sm="12")
            ferro-card(title="Anruf-Log" size="sm")
              call-log
  
</template>

<script>
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';
import PropertySelector from './property-selector.vue';
import GamblingControls from './gambling-controls.vue';
import CallLog from './call-log.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name: "NavContentBuy",
  components: {FerroCard, PropertySelector, GamblingControls, CallLog},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      properties   : 'properties.list'
    }),
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
