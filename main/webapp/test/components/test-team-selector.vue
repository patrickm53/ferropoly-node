<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 09.01.22
-->
<template lang="pug">
  div
    b-container(fluid)
      b-row
        b-col(sm="3" v-for="team in teams" :key="team.uuid")
          team-selector(:team="team", :team-color="team.color")


</template>

<script>
import {getPlayers} from '../fixtures/players';
import TeamSelector from '../../reception/components/call/team-selector.vue';
import {getTeamColor} from '../../reception/lib/teamLib';

export default {
  name      : 'TestTeamSelector',
  components: {TeamSelector},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      teamData: getPlayers()
    };
  },
  computed  : {
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
  methods   : {}
}
</script>

<style lang="scss" scoped>

</style>
