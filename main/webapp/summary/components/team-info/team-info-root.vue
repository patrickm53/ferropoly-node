<!---
  Root Element for the team Info
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 23.04.22
-->
<template lang="pug">
  b-container(fluid)
    h1 {{teamName}}
    b-row
      b-col
        ferro-nav(:elements="navElements")
        team-info-properties(:team-id="teamId" v-if="propertiesTabVisible")
        team-info-account(:team-id="teamId" v-if="teamAccountVisible")

</template>

<script>
import FerroNav from '../../../common/components/ferro-nav/ferro-nav.vue';
import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';

import TeamInfoProperties from './team-info-properties.vue';
import TeamInfoAccount from './team-info-account.vue';

export default {
  name      : 'TeamInfoRoot',
  components: {TeamInfoAccount, TeamInfoProperties, FerroNav, FerroCard},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    teamId: {
      type   : String,
      default: () => {
        return 'none'
      }
    }
  },
  data      : function () {
    return {
      navElements: [
        {title: 'Übersicht', active: true},
        {title: 'Kontobuch', active: false},
        {title: 'Reise-Log', active: false},
      ]
    };
  },
  computed  : {
    teamName() {
      return this.$store.getters['teams/idToTeamName'](this.teamId);
    },
    propertiesTabVisible() {
      return this.navElements[0].active;
    },
    teamAccountVisible() {
      return this.navElements[1].active;
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
