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
      div(v-if="navBar[1].active")
        nav-content-property
      div(v-if="navBar[2].active")
        nav-content-log


</template>

<script>
import TeamSelector from './team-selector.vue';
import FerroNav from '../../../common/components/ferro-nav/ferro-nav.vue';
import NavContentBuy from './buy-tab/nav-content-buy.vue';
import NavContentProperty from './property-tab/nav-content-property.vue';
import {mapFields} from 'vuex-map-fields';
import {get} from 'lodash';
import NavContentLog from './log-tab/nav-content-log.vue';

export default {
  name      : 'CallRoot',
  components: {NavContentLog, TeamSelector, FerroNav, NavContentBuy, NavContentProperty},
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
      this.$store.dispatch({type: 'logInfo', msg: 'Start Anrufbehandlung'});
    },
    viewTeam() {
      console.warn('Not implemented yet');
    },
    finishCall() {
      this.$store.dispatch({type: 'finishCall'});
      this.navBar.forEach(nb => {
        nb.active = false;
      })
      this.navBar[0].active = true;
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
