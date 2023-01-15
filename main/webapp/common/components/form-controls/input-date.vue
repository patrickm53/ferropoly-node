<!---
  A date input for Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 01.08.21
-->
<template lang="pug">
  div.form-input-start
    label.input-label(:for="id" v-if="label") {{label}}
    b-form-datepicker(
      :id="id"
      :value="value"
      :state="state"
      :min="min"
      :max="max"
      locale="de"
      @input="update"
      aria-describedby="input-help input-feedback"
      :disabled="disabled"
    )
    b-form-invalid-feedback(v-if="feedback") {{feedback}}
    b-form-text(v-if="help") {{help}}
</template>

<script>
import {DateTime} from 'luxon';
import InputMixin from './inputMixin';

export default {
  name      : 'InputDate',
  components: {},
  filters   : {},
  mixins    : [InputMixin],
  model     : {},
  props     : {
    value: {
      type   : String,
      default: () => {
        return ('2021-01-01');
      }
    },
    min  : {
      type   : String,
      default: () => {
        return ('2021-01-01');
      }
    },
    max  : {
      type   : String,
      default: () => {
        return ('2023-01-01');
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {
    state() {
      let val = DateTime.fromISO(this.value);
      let s   = (this.minimum <= val) && (val <= this.maximum);
      this.$emit('state', {id: this._uid, state: s});
      return s;
    },
    minimum() {
      return DateTime.fromISO(this.min);
    },
    maximum() {
      return DateTime.fromISO(this.max);
    }
  },
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
