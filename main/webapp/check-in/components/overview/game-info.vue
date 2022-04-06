<!---
  Shows contact info to the "Zentrale"
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.04.22
-->
<template lang="pug">
  div
    h4 Zentrale
    p Die Zentrale ist unter der Nummer &nbsp;
      a(:href=phoneLink) {{phoneNumber}}
      | &nbsp; erreichbar.

</template>

<script>
import {mapFields} from 'vuex-map-fields';
export default {
  name      : 'GameInfo',
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
      phoneNumber: 'gameplay.owner.organisatorPhone',
    }),
    phoneLink() {
      return `tel:${this.phoneNumber}`;
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
