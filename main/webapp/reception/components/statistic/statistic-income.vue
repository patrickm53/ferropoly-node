<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.02.22
-->
<template lang="pug">
  div
    b-row
      b-col
        income-graph

</template>

<script>
import IncomeGraph from './income-graph.vue';

export default {
  name      : 'StatisticIncome',
  components: {IncomeGraph},
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
