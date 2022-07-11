<!--
  - Copyright (c) 2021 Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  -->

<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 28.11.21
-->
<template lang="pug">
  b-row
    b-col
      ferro-card(
        title="Team Mitglieder"
        size="sm"
      )
        b-form-row(v-if="members.length === 0")
          b-col
            p Bisher wurden noch keine Team-Mitglieder erfasst.
        b-form-row(v-if="members.length > 0")
          b-col
            team-entry(v-for="member in members" :key="member.login" :member="member")
</template>

<script>
import TeamEntry from './team-entry.vue'
import FerroCard from '../../common/components/ferro-card/ferro-card.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'team-list',
  props     : {},
  data      : function () {
    return {};
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    ...mapFields([
      'members',
    ])
  },
  methods   : {},
  components: {TeamEntry, FerroCard},
  filters   : {},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
