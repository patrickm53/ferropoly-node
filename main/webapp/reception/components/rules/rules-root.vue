<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 07.01.22
-->
<template lang="pug">
  b-container(fluid)
    b-row
      rules-viewer(:rules="rules")

  
</template>

<script>
import RulesViewer from '../../../common/components/rules-viewer/rules-viewer.vue'
import {mapFields} from 'vuex-map-fields';
export default {
  name: "RulesRoot",
  components: {RulesViewer},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      rules: 'gameplay.rules'
    }),
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
