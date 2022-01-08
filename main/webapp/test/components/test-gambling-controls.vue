<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.01.22
-->
<template lang="pug">
  div
    b-container(fluid)
      b-row
        b-col(sm="2")
          gambling-controls
        b-col(sm="4")
          gambling-controls
        b-col(sm="5")
          gambling-controls
  
</template>

<script>
import GamblingControls from '../../reception/components/call/gambling-controls.vue';

export default {
  name: "TestGamblingControls",
  components: {GamblingControls},
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
