<!---
  A phone input for Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.08.21
-->
<template lang="pug">
  div.form-input-start
    label.input-label(:for="id" v-if="label") {{label}}
    b-form-input(
      :id="id"
      type="tel"
      :value="value"
      :state="state"
      @input="update"
      trim=true
      aria-describedby="input-help input-feedback"
      :disabled="disabled"
    )
    b-form-invalid-feedback(v-if="feedback") {{feedback}}
    b-form-text(v-if="help") {{help}}

</template>

<script>
import InputMixin from './inputMixin.js'

export default {
  name      : 'InputPhone',
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
