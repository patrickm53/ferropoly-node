<!---
  An email input for Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.08.21
-->
<template lang="pug">
  div.form-input-start
    label.input-label(:for="id" v-if="label") {{label}}
    b-form-input(
      :id="id"
      type="email"
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
  name      : 'InputEmail',
  components: {},
  filters   : {},
  mixins    : [InputMixin],
  model     : {},
  props     : {
    value: {
      type   : String,
      default: () => {
        return '';
      }
    },
    state: {
      type   : Boolean,
      default: () => {
        return undefined;
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    update(e) {
      this.$emit('input', e);
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'inputStyle.scss';
</style>
