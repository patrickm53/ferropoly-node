<!---
  Rules for the players
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.2022
-->
<template lang="pug">
  b-container(fluid)
    b-row
      b-col
        div(v-html="rules")


</template>

<script>
import {mapFields} from 'vuex-map-fields';
export default {
  name: "RulesRoot",
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
      rules: 'gameplay.rules.text'
    }),
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
