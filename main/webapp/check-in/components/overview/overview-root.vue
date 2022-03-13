<!---
  Front page of the dashboard
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.22
-->
<template lang="pug">
  div
    h1 {{teamName}}

</template>

<script>
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'OverviewRoot',
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
      teamName: 'checkin.team.data.name',
    }),
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
