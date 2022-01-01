<!---
  The chance view
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 23.12.21
-->
<template lang="pug">
  b-container(fluid)
    b-row
      b-col
        h1 Chance/Kanzlei
    b-row
      b-col(sm="12" md="4")
        ferro-card(title="Übersicht")
          chance-summary
      b-col(sm="12" md="8")
        ferro-card(title="Transaktionen")
          chance-account(:transactions="chancellery")
  
</template>

<script>
import ChanceSummary from './chance-summary.vue';
import ChanceAccount from '../../../lib/components/chanceAccount.vue'
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';
import {mapFields} from 'vuex-map-fields';



export default {
  name: "ChanceRoot",
  components: {ChanceSummary, ChanceAccount, FerroCard},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      chancellery: 'chancellery.list'
    }),
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
