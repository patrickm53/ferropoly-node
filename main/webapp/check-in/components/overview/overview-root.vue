<!---
  Front page of the dashboard
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.03.22
-->
<template lang="pug">
  b-container(fluid)
    h2 {{teamName}}
    b-row
      b-col
        basic-info
    b-row
      b-col
        game-info
    b-row
      b-col
        game-events

</template>

<script>
import {mapFields} from 'vuex-map-fields';
import GameEvents from './game-events.vue';
import BasicInfo from './basic-info.vue';
import GameInfo from './game-info.vue';

export default {
  name      : 'OverviewRoot',
  components: {BasicInfo, GameEvents, GameInfo},
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
