<!---
  A time input for Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 01.08.21
-->
<template lang="pug">
  div.form-input-start
    label.input-label(:for="id" v-if="label") {{label}}
    b-form-timepicker(
      :id="id"
      :value="value"
      :state="state"
      locale="de"
      @input="update"
      aria-describedby="input-help input-feedback"
    )
    b-form-invalid-feedback(v-if="feedback") {{feedback}}
    b-form-text(v-if="help") {{help}}
</template>

<script>
import InputMixin from './inputMixin';

export default {
  name      : 'input-time',
  props     : {
    value: {
      type   : String,
      default: () => {
        return ('05:00:00');
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

