<!---
  Shows a modal error dialog. Shall be used for all Errors (Errors only!)

  Can be displayed either via function or visible property

  11.4.2021 KC
-->
<template lang="pug">
  div
    b-modal#agb(
      v-model="dialogActive"
      header-class="errorHeader"
      ref="modal-error"
      :size="size"
      :title="titleText"
      header-bg-variant="danger"
      hide-header-close=true
      ok-only=true)
      .modal-body
        div(v-html="infoText")
        div(v-html="messageText")
</template>

<script>
export default {
  name      : 'modal-error',
  props     : {
    visible: {
      type   : Boolean,
      default: () => {
        return false;
      }
    },
    size   : {
      type   : String,
      default: () => {
        return 'md';
      }
    },
    title  : {
      type   : String,
      default: () => {
        return null;
      }
    },
    info   : {
      type   : String,
      default: () => {
        return null;
      }
    },
    message: {
      type   : String,
      default: () => {
        return null;
      }
    }
  },
  data      : function () {
    return {
      titleX     : '',
      infoX      : '',
      messageX   : '',
      showDialogX: false
    };
  },
  computed  : {
    titleText() {
      return (this.title || this.titleX);
    },
    infoText() {
      return (this.info || this.infoX);
    },
    messageText() {
      return (this.message || this.messageX);
    },
    dialogActive: {
      get: function () {
        return this.visible || this.showDialogX;
      },
      set: function (e) {
        this.showDialogX = false;
        if (!e) {
          this.$emit('close');
        }
      }
    }
  },
  model     : {},
  methods   : {
    /**
     * Using this function starts the dialog
     * @param options contains the different elements of the dialog
     */
    showDialog: function (options) {
      this.titleX      = options.title;
      this.infoX       = options.info;
      this.messageX    = options.message;
      this.showDialogX = true;
      //this.$refs['modal-error'].show();
    },
    showError(title, info, message) {
      console.warn('showError is obsolete, use showDialog instead');
      this.showDialog({title, info, message});
    }
  },
  components: {}
}
</script>

<style scoped>
/deep/ .errorHeader {
  color: white;
}
</style>
