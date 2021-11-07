<!---
  Join the game
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.11.21
-->
<template lang="pug">
  div
    b-container(fluid)
      b-row
        b-col(sm="6")
          h1 {{gamename}}
          h3(v-if="organisation") {{organisation}}
          div(v-html="infotext")
          h4.join Spieldaten
          b-row
            b-col(sm="4") Datum
            b-col(sm="8") {{gameDate | formatGameDate}}
          b-row
            b-col(sm="4")
            b-col(sm="8") {{gameStart | formatGameTime}} - {{gameEnd | formatGameTime}}
          b-row
            b-col(sm="4") Anmeldeschluss
            b-col(sm="8") {{joiningDeadline}}
          h4.join Kontakt
          b-row
            b-col(sm="4") Name
            b-col(sm="8") {{organisatorName}}
          b-row
            b-col(sm="4") Email
            b-col(sm="8")
              a(:href="organisatorEmail") {{organisatorEmail}}
          b-row
            b-col(sm="4") Telefonnummer
            b-col(sm="8") {{organisatorPhone}}
          div(v-if="teamExists")
            h4.join Meine Anmeldung
            b-row
              b-col(sm="4") Anmeldedatum
              b-col(sm="8") {{registrationDate | formatDateTime}}
            b-row
              b-col(sm="4") Letzte Änderung
              b-col(sm="8") {{changedDate | formatDateTime}}
            b-row
              b-col(sm="4") Anmeldung bestätigt
              b-col(sm="8") {{confirmed | booleanYesNo}}

        b-col(sm="6")
          team-edit(v-if="joiningPossible")
          join-not-allowed(v-if="!joiningPossible")

</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatGameDate, formatGameTime, formatDateTime, booleanYesNo} from '../../common/lib/formatters';
import TeamEdit from './team-edit.vue';
import JoinNotAllowed from './join-not-allowed.vue';
import {DateTime} from 'luxon';
export default {
  name      : 'join-game',
  props     : {},
  data      : function () {
    return {};
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    ...mapFields([
      'gameplay.gamename',
      'gameplay.owner.organisation',
      'gameplay.owner.organisatorName',
      'gameplay.owner.organisatorEmail',
      'gameplay.owner.organisatorPhone',
      'gameplay.joining.infotext',
      'gameplay.joining.possibleUntil',
      'gameplay.scheduling.gameDate',
      'gameplay.scheduling.gameStart',
      'gameplay.scheduling.gameEnd',
      'teamInfo.id',
      'teamInfo.registrationDate',
      'teamInfo.changedDate',
      'teamInfo.confirmed',
    ]),
    teamExists() {
      if (!this.id) {
        return false;
      }
      return this.id.length > 0;
    },
    joiningPossible() {
      console.log('Jonn', this.$store.getters.joiningPossible)
      return this.$store.getters.joiningPossible;
    },
    joiningDeadline() {
      let date= formatDateTime(this.possibleUntil);

      let deadline = DateTime.fromISO(this.possibleUntil);
      let now = DateTime.now();
      if (deadline.minus({days: 7}) < now && now < deadline) {
        date += ', ' + deadline.toRelative();
      }
      return date;
    }
  },
  methods   : {},
  components: {TeamEdit, JoinNotAllowed},
  filters   : {formatGameDate, formatGameTime, formatDateTime, booleanYesNo},
  mixins    : []
}
</script>

<style lang="scss" scoped>
h4.join {
  border-bottom: #ccc;
  border-right: none;
  border-left: none;
  border-top: none;
  border-bottom-width: thin;
  border-bottom-style: solid;
  margin-top: 5px;
}

</style>
