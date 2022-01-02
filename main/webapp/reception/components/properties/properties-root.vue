<!---
  Root element for the price list in the reception
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.01.22
-->
<template lang="pug">
  b-container(fluid)
    b-row
      b-col(sm="12" md="6")
        property-list(
          :properties="properties"
          @property-selected="onPropertySelected")
      b-col(sm="12" md="6")
        ferro-card(title="Transaktionen")
          property-info


</template>

<script>
import PropertyList from './property-list.vue';
import PropertyInfo from './property-info.vue';
import FerroCard from './../../../common/components/ferro-card/ferro-card.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'PropertiesRoot',
  components: {FerroCard, PropertyInfo, PropertyList},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      properties: 'properties.list'
    }),
  },
  created   : function () {
  },
  methods   : {
    onPropertySelected(property) {
      console.log('Property selected', property);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
