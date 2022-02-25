<!---
  Modal dialog asking how to edit a call from a team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.02.22
-->
<template lang="pug">
  b-modal#modal-scoped(ref="modal-confirmation")
    template(#modal-footer="{ ok, cancel, hide }")
      b Custom Footer
      // Emulate built in modal footer ok and cancel button actions
      b-button(size="sm", variant="success", @click="ok()")
        | OK
      b-button(size="sm", variant="danger", @click="cancel()")
        | Cancel
      // Button with custom close trigger value
      b-button(size="sm", variant="outline-secondary", @click="hide('forget')")
        | Forget it


</template>

<script>
export default {
  name: "CallConfirmModal",
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
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
      this.title    = options.title;
      this.info     = options.info;
      this.message  = options.message;
      this.callback = options.callback;
      this.context  = options.context;
      this.$refs['modal-confirmation'].show();
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
