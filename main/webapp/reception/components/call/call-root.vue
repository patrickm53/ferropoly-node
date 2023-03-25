<!---
  The call handling panel
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.22 - 34 years ago was a day I'll always remember
-->
<template lang="pug">
  b-container(fluid)
    call-confirm-modal(ref="confirm" @normal-call="onNormalCall" @silent-call="onSilentCall" @cancel="onCancel")
    div(v-if="!callActive")
      h2 Bitte anrufendes Team auswählen
      b-row
        b-col(sm="3" v-for="team in teams" :key="team.uuid")
          team-selector(:team="team", :team-color="team.color" :enabled="gameActive" @manage-call="manageCall" @view-team="viewTeam")
    div(v-if="callActive")
      h2 {{teamName}}
        font#color-tag(:style="cssVars")  &#9608;&#9608;
      b-button.finish-call-button(@click="finishCall" variant="info") Anruf beenden
      ferro-nav(:elements="navBar")
      div(v-if="navBar[0].active")
        nav-content-buy(:enabled="gameActive")
      div(v-if="navBar[1].active")
        nav-content-property(:enabled="gameActive")
      div(v-if="navBar[2].active")
        nav-content-pictures
      div(v-if="navBar[3].active")
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
import CallConfirmModal from './call-confirm-modal.vue';
import axios from 'axios';
import {formatPrice} from '../../../common/lib/formatters';
import NavContentPictures from "./image-tab/NavContentPictures.vue";

export default {
  name      : 'CallRoot',
  components: {
    NavContentPictures,
    CallConfirmModal, NavContentLog, TeamSelector, FerroNav, NavContentBuy, NavContentProperty},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      navBar: [
        {title: 'Kaufen', active: true},
        {title: 'Besitz', active: false},
        {title: 'Bilder', active: false},
        {title: 'Log', active: false},
      ]
    };
  },
  computed  : {
    ...mapFields({
      teamData   : 'teams.list',
      callActive : 'call.callActive',
      currentTeam: 'call.currentTeam',
      gameId     : 'gameId',
      teamUuid   : 'call.currentTeam.uuid',
      authToken  : 'api.authToken'
    }),
    gameActive() {
      return this.$store.getters.gameIsActive;
    },
    teams() {
      return this.teamData;
    },
    teamName() {
      return this.$store.getters['teams/idToTeamName'](get(this.currentTeam, 'uuid', 'nobody'));
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
    /**
     * Modal dialog: a "silent call" is one without gambling chance, in case you forgot to
     * do something in the last call
     * @param info
     */
    onSilentCall(info) {
      this.$store.dispatch({type: 'initCall', team: info.team});
      this.$store.dispatch({type: 'logInfo', msg: 'Start Nachbearbeitung'});
    },
    /**
     * Modal dialog: handle a normal call, including gambling
     * @param info
     */
    onNormalCall(info) {
      this.$store.dispatch({type: 'initCall', team: info.team});
      this.$store.dispatch({type: 'logInfo', msg: 'Start Anrufbehandlung'});
      axios.post(
          `/chancellery/play/${this.gameId}/${this.teamUuid}`,
          {authToken: this.authToken}
      ).then(resp => {
        console.log('GAMBLING', resp.data);
        let res      = resp.data.result;
        let logEntry = {
          title: res.infoText || res.title,
          msg  : formatPrice(res.amount)
        }
        if (res.amount < 0) {
          logEntry.type = 'logFail';
        } else {
          logEntry.type = 'logSuccess';
        }
        this.$store.dispatch(logEntry);
      }).catch(err => {
        console.error(err);
        let errorText = get(err, 'message', 'Fehler Chance/Kanzlei');
        errorText += ': ' + get(err, 'response.data.message', 'Allgemeiner Fehler');
        console.error(errorText);
        this.$store.dispatch({
          type : 'logFail',
          title: 'Programmfehler',
          msg  : errorText
        });
      });
    },
    /**
     * Modal dialog canceled
     */
    onCancel() {
      console.warn('you ain\'t seen me, right?');
    },
    /**
     * A team was selected for calling
     * @param info
     */
    manageCall(info) {
      // Show modal dialog
      console.log('manageCall', info);
      this.$refs.confirm.showDialog(info);
    },
    /**
     * After a game is played (or before): view the team
     * @param info
     */
    viewTeam(info) {
      this.$store.dispatch({type: 'viewTeam', team: info.team});
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
