<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 26.03.23
-->
<template lang="pug">
div
  reception-pictures(no-pic-lead="Es gibt von diesem Spiel leider keine Bilder."
  no-pic-text=""
  extended)

</template>

<script>
import ReceptionPictures from "../../../lib/components/ReceptionPictures.vue";

export default {
  name      : "SummaryPicturesRoot",
  components: {ReceptionPictures},
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
