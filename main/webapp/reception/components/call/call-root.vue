<!---
  The call handling panel
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.22 - 34 years ago was a day I'll always remember
-->
<template lang="pug">
  b-container(fluid)
    b-row(v-if="!callActive")
      h2 Bitte anrufendes Team auswählen
      b-col(sm="3" v-for="team in teams" :key="team.uuid")
        team-selector(:team="team", :team-color="team.color" @manage-call="manageCall" @viewTeam="viewTeam")
    b-row(v-if="callActive")
      h1 hello

</template>

<script>
import TeamSelector from './team-selector.vue';
import {mapFields} from 'vuex-map-fields';
import {getTeamColor} from '../../lib/teamLib';

export default {
  name      : 'CallRoot',
  components: {TeamSelector},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      teamData  : 'teams.list',
      callActive: 'call.callActive'
    }),
    teams() {
      let self = this;
      for (let i = 0; i < this.teamData.length; i++) {
        self.teamData[i].color = getTeamColor(i);
      }
      return this.teamData;
    }
  },
  created   : function () {
  },
  methods   : {
    manageCall(team) {
      console.log('Call active for', team);
      this.callActive = true;
    },
    viewTeam() {
      console.warn('Not implemented yet');
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
