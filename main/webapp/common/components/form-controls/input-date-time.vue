<!---
  A date and combined time input for Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 09.08.21
-->
<template lang="pug">
  div.form-input-start
    label.input-label(:for="id" v-if="label") {{label}}
    b-row
      b-col(xs="12" sm="12" md="6")
        b-form-datepicker(
          :id="id"
          v-model="formDate"
          :min="min"
          :max="max"
          :disabled="disabled"
        )
      b-col(xs="12" sm="12" md="6")
        b-form-timepicker(
          v-model="formTime"
          locale="de"
          aria-describedby="input-help input-feedback"
          :disabled="disabled"
        )
    b-form-invalid-feedback(v-if="feedback") {{feedback}}
    b-form-text(v-if="help") {{help}}

</template>

<script>
import InputMixin from './inputMixin.js';
import {DateTime} from 'luxon';

export default {
  name      : 'InputDateTime',
  components: {},
  filters   : {},
  mixins    : [InputMixin],
  model     : {},
  props     : {
    value: {
      type   : String,
      default: () => {
        return DateTime.now().toISO();
      }
    },
    min  : {
      type   : String,
      default: () => {
        return DateTime.now().toISO();
      }
    },
    max  : {
      type   : String,
      default: () => {
        return DateTime.now().plus({month: 1}).toISO();
      }
    }

  },
  data      : function () {
    return {};
  },
  computed  : {
    formDate: {
      get() {
        return this.value;
      },
      set(e) {
        let d = DateTime.fromISO(e);
        let t = DateTime.fromISO(this.value);
        d     = d.set({hour: t.hour, minute: t.minute, second: 0});
        this.$emit('input', d.toISO());
      }
    },
    formTime: {
      get() {
        return DateTime.fromISO(this.value).toFormat('HH:mm:00');
      },
      set(e) {
        let d = DateTime.fromISO(e);
        let t = DateTime.fromISO(this.value);
        d     = d.set({year: t.year, month: t.month, day: t.day});
        this.$emit('input', d.toISO());
      }
    }
  },
  created   : function () {
  },
  methods   : {

  }
}
</script>


<style lang="scss" scoped>
@import './inputStyle.scss';

</style>
