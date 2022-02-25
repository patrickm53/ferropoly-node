<!---
  Modal dialog asking how to edit a call from a team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.02.22
-->
<template lang="pug">
  b-modal#modal-scoped(ref="modal-confirmation" title="Team bestätigen")
    p Bitte bestätigen, dass das folgende Team bearbeitet werden soll:
    h3 {{teamName}}
    h4 {{organization}}
    p Möglichkeiten:
    ul
      li Mit "Bearbeiten" wird ein normaler Anruf eingeleitet, d.h. Chance/Kanlzei wird ausgeführt
      li Mit "Nachtrag" kann ein unterbrochener Anruf fortgesetzt werde, Chance/Kanlzei wird nicht ausgeführt
      li Mit "Abbrechen" verlässt Du diesen Dialog ohne weitere Aktionen
    p Was willst Du tun?
    template(#modal-footer="{ ok, cancel, hide }")
      // Emulate built in modal footer ok and cancel button actions
      b-button(variant="primary", @click="normalCall")
        | Bearbeiten
      b-button(variant="secondary", @click="silentCall")
        | Nachtrag
      b-button(variant="secondary", @click="cancel()")
        | Abbrechen

</template>

<script>
import {get} from 'lodash';

export default {
  name      : 'CallConfirmModal',
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      teamName    : '',
      organization: '',
      team        : {}
    };
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    /**
     * Using this function starts the dialog
     * @param options contains the different elements of the dialog
     */
    showDialog: function (options) {
      this.teamName     = get(options, 'team.data.name', 'none');
      this.organization = get(options, 'team.data.organization', 'none');
      this.team         = options;
      this.$refs['modal-confirmation'].show();
    },
    normalCall() {
      this.$emit('normal-call', this.team);
      this.$refs['modal-confirmation'].hide();
    },
    silentCall() {
      this.$emit('silent-call', this.team);
      this.$refs['modal-confirmation'].hide();
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
