<!---
  A text input for Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.08.21
-->
<template lang="pug">
  div.form-input-start
    label.input-label(:for="id" v-if="label") {{label}}
    b-form-input(
      type="text"
      :id="id"
      :value="value"
      :state="state"
      :disabled="disabled"
      @input="update"
      trim=true
      aria-describedby="input-help input-feedback"
    )
    b-form-invalid-feedback(v-if="feedback") {{feedback}}
    b-form-text(v-if="help") {{help}}

</template>

<script>
import InputMixin from './inputMixin.js'

export default {
  name      : 'input-text',
  props     : {
    value   : {
      type   : String,
      default: () => {
        return '';
      }
    }, min  : {
      type   : String,
      default: () => {
        return '0';
      }
    },
    max     : {
      type   : String,
      default: () => {
        return '100';
      }
    },
    disabled: {
      type   : Boolean,
      default: () => {
        return false;
      }
    },
    state   : {
      type   : Boolean,
      default: () => {
        return undefined;
      }
    }
  },
  data      : function () {
    return {};
  },
  model     : {},
  created   : function () {
  },
  computed  : {},
  methods   : {
    update(e) {
      this.$emit('input', e);
    }
  },
  components: {},
  filters   : {},
  mixins    : [InputMixin]
}
</script>

<style lang="scss" scoped>
@import 'inputStyle.scss';
</style>
