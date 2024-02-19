<!---
  Card with the teams
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.10.21
-->
<template lang="pug">
  div
    ferro-card(title="Angemeldete Teams")
      b-table(striped small :items="teams" :fields="fields" responsive="sm" v-if="teams.length > 0")
        template(#cell(name)="data") {{data.item.name}}
        template(#cell(data.organization)="data") {{data.item.organization}}
        template(#cell(data.teamLeader.name)="data") {{data.item.teamLeaderName}}
      p(v-if="teams.length === 0") Bisher haben sich noch keine Teams für das Spiel angemeldet.

</template>

<script>
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'BasicTeams',
  components: {FerroCard},
  data      : function () {
    return {
      fields: [
        {key: 'name', label: 'Team'},
        {key: 'data.organization', label: 'Organisation'},
        {key: 'data.teamLeader.name', label: 'Leitung'}
      ]
    };
  },
  computed  : {
    ...mapFields([
      'teams'
    ]),
  },
  methods   : {},
}
</script>

<style lang="scss" scoped>

</style>
