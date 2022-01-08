<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.01.22
-->
<template lang="pug">
  div
    h1 Property Selector Tests
    b-container(fluid)
      b-row
        b-col(sm="6")
          property-selector(:properties="properties")
        b-col(sm="4")
          property-selector(:properties="properties" per-page="5" )

</template>

<script>
import PropertySelector from '../../lib/components/property-selector.vue'
import {getProperties} from '../fixtures/properties';

export default {
  name      : 'TestPropertySelector',
  components: {PropertySelector},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    properties() {
      return (getProperties());
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
