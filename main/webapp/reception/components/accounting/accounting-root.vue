<!---
  The books of Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.12.21
-->
<template lang="pug">
  b-container(fluid)
    b-row
      b-col
        h1 Kontobuch
    b-row
      b-col
        b-tabs
          team-tab(v-for="team in teams" :key="team._id" :team-id="team.uuid")

</template>

<script>

import TeamTab from './team-tab.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name: "AccountingRoot",
  components: {TeamTab},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      teams: 'teams.list'
    }),

  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
