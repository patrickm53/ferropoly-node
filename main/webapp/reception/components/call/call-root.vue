<!---
  The call handling panel
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.22 - 34 years ago was a day I'll always remember
-->
<template lang="pug">
  b-container(fluid)
    div(v-if="!callActive")
      h2 Bitte anrufendes Team auswählen
      b-row
        b-col(sm="3" v-for="team in teams" :key="team.uuid")
          team-selector(:team="team", :team-color="team.color" @manage-call="manageCall" @viewTeam="viewTeam")
    div(v-if="callActive")
      h2 {{teamName}}
        font#color-tag(:style="cssVars")  &#9608;&#9608;
      b-button.finish-call-button(@click="finishCall") Anruf beenden
      ferro-nav(:elements="navBar")
      div(v-if="navBar[0].active")
        nav-content-buy
      div(v-if="navBar[1].active") NAV2
      div(v-if="navBar[2].active") NAV3


</template>

<script>
import TeamSelector from './team-selector.vue';
import FerroNav from '../../../common/components/ferro-nav/ferro-nav.vue';
import NavContentBuy from './nav-content-buy.vue';
import {mapFields} from 'vuex-map-fields';
import {getTeamColor} from '../../lib/teamLib';
import {get} from 'lodash';

export default {
  name      : 'CallRoot',
  components: {TeamSelector, FerroNav, NavContentBuy},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      navBar: [
        {title: 'Kaufen', active: true},
        {title: 'Besitz', active: false},
        {title: 'Log', active: false},
      ]
    };
  },
  computed  : {
    ...mapFields({
      teamData   : 'teams.list',
      callActive : 'call.callActive',
      currentTeam: 'call.currentTeam'
    }),
    teams() {
      let self = this;
      for (let i = 0; i < this.teamData.length; i++) {
        self.teamData[i].color = getTeamColor(i);
      }
      return this.teamData;
    },
    teamName() {
      return this.$store.getters.teamIdToTeamName(get(this.currentTeam, 'uuid', 'nobody'));
    },
    cssVars() {
      return {
        '--team-color': this.currentTeam.color
      }
    }
  },
  created   : function () {
  },
  methods   : {
    manageCall(info) {
      this.$store.dispatch({type: 'initCall', team: info.team});
      this.$store.dispatch({type: 'logInfo',  msg: 'Start Anrufbehandlung'});
    },
    viewTeam() {
      console.warn('Not implemented yet');
    },
    finishCall() {
      this.$store.dispatch({type: 'finishCall'});
    }

  }
}
</script>

<style lang="scss" scoped>
#color-tag {
  color: var(--team-color);
  position: absolute;
  right: 25px;
}

.finish-call-button {
  display: inline-block;
  position: absolute;
  right: 10px;
}
</style>
