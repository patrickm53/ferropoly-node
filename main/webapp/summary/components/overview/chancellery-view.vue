<!---
  Chancellery container
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.04.22
-->
<template lang="pug">
  b-container(fluid)
    b-row
      b-col
        chance-account.mt-2(:transactions="chancellery")

  


</template>

<script>
import ChanceAccount from '../../../lib/components/chanceAccount.vue'
import {mapFields} from 'vuex-map-fields';

export default {      name: 'ChancelleryView',
  components: {ChanceAccount},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      chancellery   : 'chancellery.list'
    }),
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
