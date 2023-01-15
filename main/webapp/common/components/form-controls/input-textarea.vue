<!---
  A text area for Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 07.11.21
-->
<template lang="pug">
  div.form-input-start
    label.input-label(:for="id" v-if="label") {{label}}
    b-form-textarea(
      :id="id"
      :value="value"
      :state="state"
      :disabled="disabled"
      :placeholder="placeholder"
      :rows="rows"
      :max-rows="maxRows"
      :size="size"
      @input="update"
      aria-describedby="input-help input-feedback"
    )
    b-form-invalid-feedback(v-if="feedback") {{feedback}}
    b-form-text(v-if="help") {{help}}
</template>

<script>
import InputMixin from './inputMixin.js'

export default {
  name: "InputTextarea",
  components: {},
  filters: {},
  mixins: [InputMixin],
  model: {},
  props: {
    value   : {
      type   : String,
      default: () => {
        return '';
      }
    },
    placeholder  : {
      type   : String,
      default: () => {
        return '';
      }
    },
    rows  : {
      type   : String,
      default: () => {
        return '3';
      }
    },
    maxRows  : {
      type   : String,
      default: () => {
        return '6';
      }
    },
    size  : {
      type   : String,
      default: () => {
        return 'md';
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
  data: function() {
    return {};
  },
  computed: {},
  created: function() {
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
