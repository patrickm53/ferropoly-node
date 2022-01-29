<!---
  A selector for a single team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 09.01.22
-->
<template lang="pug">
  ferro-card(:title="team.data.name" size="sm")
    template(v-slot:controls)
      font#color-tag(:style="cssVars")  &#9608;&#9608;
    p {{teamName}}
    details
      .team-leader-phone
        a(:href="'tel:' + team.data.teamLeader.phone") {{team.data.teamLeader.phone}}
      .team-leader-email
        a(:href="'mailto:' + team.data.teamLeader.email") {{team.data.teamLeader.email}}
      .team-leader-remarks {{team.data.remarks}}
      // Neither implemented nor tested yet:
      //.team-members(v-if='team.data.members')
        | Teammitglieder:
        .team-member(v-for="m in team.members" :key="m")
          .team-member-login {{m}}
    p
      b-button(v-if="gameActive" variant="primary" @click="onManageCall") Anruf bearbeiten
      b-button(v-if="!gameActive" variant="primary" @click="onViewTeam") Team ansehen

</template>

<script>

import FerroCard from '../../../common/components/ferro-card/ferro-card.vue';
import {get} from 'lodash';

export default {
  name      : 'TeamSelector',
  components: {FerroCard},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    team      : {
      type   : Object,
      default: () => {
        return {
          data: {
            name        : '',
            organization: '',
            teamLeader  : {
              name : '',
              email: '',
              phone: ''
            },
            members     : null
          }
        }
      }
    },
    gameActive: {
      type   : Boolean,
      default: () => {
        return true;
      }
    },
    teamColor : {
      type   : String,
      default: () => {
        return 'pink';
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {
    teamName() {
      let retVal = get(this.team, 'data.organization', '');
      let name   = get(this.team, 'data.teamLeader.name', '');
      if (retVal.length > 0 && name.length > 0) {
        retVal += ', ';
      }
      retVal += name;
      return retVal;
    },
    cssVars() {
      return {
        '--team-color': this.teamColor
      }
    }
  },
  created   : function () {
  },
  methods   : {
    onManageCall() {
      this.$emit('manage-call', {team: this.team});
    },
    onViewTeam() {
      this.$emit('view-team', {team: this.team});
    }
  }
}
</script>

<style lang="scss" scoped>
#color-tag {
  color: var(--team-color);
}
</style>
