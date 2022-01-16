<!---
  Info bar when a call is active
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.22
-->
<template lang="pug">
  div(@click="onClick")
    b-alert(v-if="callActive" variant="danger" show ) Anruf ist aktiv. Bitte unter "Anruf behandeln" beenden.

</template>

<script>
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'CallActiveWarning',
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      callActive: 'call.callActive',
      panel     : 'panel'
    }),
  },
  created   : function () {
  },
  methods   : {
    /**
     * I agree, it's a bit hacky when the panel is set by a component but this allows a really simple and reusable
     * solution
     */
    onClick() {
      console.log('switching panel');
      this.panel = 'panel-call';
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
