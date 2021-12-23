<!---
  The chance view
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 23.12.21
-->
<template lang="pug">
  div
    h1 Chance/Kanzlei
    b-row
      b-col
        chance-summary
      b-col
  
</template>

<script>
import ChanceSummary from './chance-summary.vue';

export default {
  name: "ChanceRoot",
  components: {ChanceSummary},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {},
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
