<!---
  Basic root view
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.10.21
-->
<template lang="pug">
  div
    b-row
      b-col
        h1 {{gamename}}
    b-row
      b-col(col lg="6" sm="12")
        b-row
          b-col
            basic-gameinfo
        b-row
          b-col
            basic-pricelist
      b-col(col lg="6" sm="12")
        basic-teams

</template>

<script>
import {mapFields} from 'vuex-map-fields';
import BasicGameinfo from './basic-gameinfo.vue';
import BasicTeams from './basic-teams.vue';
import BasicPricelist from './basic-pricelist.vue';

export default {
  name: "info-basic-root",
  props: {},
  data: function() {
    return {};
  },
  model: {},
  created: function() {
  },
  computed: {
    ...mapFields([
      'gameplay.gamename',
      'gameplay.owner.organisatorName'
    ]),
  },
  methods: {},
  components: {BasicGameinfo, BasicTeams, BasicPricelist},
  filters: {},
  mixins: []
}
</script>

<style lang="scss" scoped>

</style>
