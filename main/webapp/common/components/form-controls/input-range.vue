<!---
  Range input control
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.08.21
-->
<template lang="pug">
  div.form-input-start
    label.input-label(:for="id" v-if="label") {{label}}
    b-form-input(
      type="range"
      :id="id"
      :value="value"
      :min="min.toString()"
      :max="max.toString()"
      :step="step"
      @input="update"
      aria-describedby="input-help input-feedback"
      :disabled="disabled"
    )
    div.value {{val}}
    b-form-invalid-feedback(v-if="feedback") {{feedback}}
    b-form-text(v-if="help") {{help}}

</template>

<script>
import InputMixin from './inputMixin.js'

export default {
  name      : 'InputRange',
  components: {},
  filters   : {},
  mixins    : [InputMixin],
  model     : {},
  props     : {
    value    : {
      type   : Number,
      default: () => {
        return 0.0;
      }
    },
    min      : {
      type   : String,
      default: () => {
        return '0.0';
      }
    },
    max      : {
      type   : String,
      default: () => {
        return '10.0';
      }
    },
    step     : {
      type   : String,
      default: () => {
        return '1';
      }
    },
    formatter: {
      type   : Function,
      default: function (s) {
        return s;
      }

    }
  },
  data      : function () {
    return {};
  },
  computed  : {
    val() {
      return this.formatter(this.value);
    }
  },
  created   : function () {
  },
  methods   : {
    update(e) {
      this.$emit('input', parseFloat(e));
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'inputStyle.scss';

.value {
  text-align: center;
  width: 100%;
}
</style>
