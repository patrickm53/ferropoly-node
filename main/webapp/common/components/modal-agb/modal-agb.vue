<!---
  Displayed modal dialog for accepting AGB

  10.4.2021 KC
-->
<template lang="pug">
div
  b-modal#agb(ref="modal-agb" title="Ferropoly AGB" hide-header-close=true cancel-title="Ablehnen"
    ok-title="Annehmen" @cancel="declineAgb" @ok="acceptAgb")
    .modal-body
      p Für die Benutzung dieser Software muss den Ferropoly AGBs zugestimmt werden. Diese sind unter&nbsp;
        a(href='http://www.ferropoly.ch/agb/' target='_blank') http://www.ferropoly.ch/agb/
        | &nbsp; im Detail einsehbar.
      p Zusammengefasst geht es darin um:
      ul
        li Die Verwendung Deiner Daten, welche bei der Benutzung der Software anfallen
        li Die Verwendung dieser Software für kommerzielle Spiele
        li Wer die Risiken bei der Benutzung dieser Software trägt
      p
      p(v-if="newAgb") Die bereits von Dir akzeptierten AGBs wurden angepasst, deshalb ist eine erneute Bestätigung notwendig.
      p
      p Mit "Annehmen" stimmst Du den Bestimmungen der aktuellen Version zu.
</template>

<script>
import $ from 'jquery';

export default {
  name      : "modal-agb",
  props     : [],
  data      : function () {
    return {};
  },
  model     : {
    actionRequired    : true,
    currentAgbVersion : 0,
    acceptedAgbVersion: 0,
    event             : 'logout'
  },
  created   : function () {
    let self = this;
    $.ajax('/agb', {dataType: 'json'})
        .done(function (resp) {
          console.log(resp);
          self.actionRequired     = resp.info.actionRequired
          self.currentAgbVersion  = resp.info.currentAgbVersion
          self.acceptedAgbVersion = resp.info.agbAcceptedVersion || 10000
          if (self.actionRequired) {
            self.$refs['modal-agb'].show();
          }
        })
        .fail(function (err) {
          console.error(err);
        })
  },
  methods   : {
    /**
     * Returns true, if the AGB were updated
     * @returns {boolean}
     */
    newAgb() {
      return this.acceptedAgbVersion < this.currentAgbVersion;
    },
    /**
     * Accept the AGB -> go on
     */
    acceptAgb() {
      console.log('accept')
      $.post('/agb/accept')
          .done(function (resp) {
            console.log(resp);
          })
          .fail(function (err) {
            console.error(err);
          })
    },
    /**
     * Decline AGB: Logout, go to loin page
     */
    declineAgb() {
      let self = this;
      console.log('decline')
      $.post('/logout')
          .done(function (resp) {
            console.log(resp);
          })
          .fail(function (err) {
            console.error(err);
          })
          .always(function () {
            self.$router.replace({name: 'home'})
          });

    }
  },
  components: {}
}
</script>

<style scoped>

</style>
