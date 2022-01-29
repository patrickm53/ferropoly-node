<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.01.22
-->
<template lang="pug">
  div
    b-container(fluid)
      b-row
        b-col(sm="3")
          gambling-controls(@win="onWin" @loose="onLoose" min="0" max="5000")
          call-log(ref="log1")
        b-col(sm="4")
          gambling-controls(@win="onWin" @loose="onLoose" min="500" max="50000")
          call-log(ref="log2")
        b-col(sm="5")
          gambling-controls(@win="onWin" @loose="onLoose" min="1" max="500")
          call-log(ref="log3")
  
</template>

<script>
import GamblingControls from '../../reception/components/call/buy-tab/gambling-controls.vue';
import CallLog from '../../reception/components/call/buy-tab/call-log.vue';

export default {
  name: "TestGamblingControls",
  components: {GamblingControls, CallLog},
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
  methods   : {
    onWin(e) {
      this.$refs.log1.pushInfoMessage(`Chance Kanzlei: ${e} Gewinn`)
      this.$refs.log2.pushSuccessMessage(`Chance Kanzlei: ${e} Gewinn werden dem Team gutgeschrieben`)
      this.$refs.log3.pushSuccessMessage(`Chance Kanzlei: ${e} Gewinn`)
    },
    onLoose(e) {
      this.$refs.log1.pushInfoMessage(`Chance Kanzlei: ${e} Verlust`)
      this.$refs.log2.pushErrorMessage(`Chance Kanzlei: ${e} Verlust werden dem Team abgezogen`)
      this.$refs.log3.pushInfoMessage(`Chance Kanzlei: ${e} Verlust`)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
