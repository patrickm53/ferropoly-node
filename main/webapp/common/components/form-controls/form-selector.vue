<!---
  Ferropoly Selector control
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.08.21
-->
<template lang="pug">
  div.form-input-start
    label.input-label(:for="id" v-if="label") {{label}}
    b-form-select(
      :id="id"
      v-model="valueC"
      :options="options"
      :state="state"
      @inputw="update"
      @change="update"
      aria-describedby="input-help input-feedback"
      :disabled="disabled"
    )
    b-form-invalid-feedback(v-if="feedback") {{feedback}}
    b-form-text(v-if="help") {{help}}

</template>

<script>
import InputMixin from './inputMixin';

export default {
  name      : 'FormSelector',
  components: {},
  filters   : {},
  mixins    : [InputMixin],
  model     : {},
  props     : {
    value  : {
      default: () => {
        return -1;
      }
    },
    options: {
      type   : Array,
      default: () => {
        return ([]);
      }
    },
  },
  data      : function () {
    return {};
  },
  computed  : {
    state() {
      return this.calculateState();
    },
    valueC: {
      get() {
        return this.value;
      },
      set(e) {
        this.$emit('input', e);
      }
    }
  },
  created   : function () {
  },
  methods   : {
    update(e) {
      console.log('update', e);
      this.$emit('input', e);
      this.calculateState();
    },
    /**
     * Calculates the current state
     * @returns {boolean}
     */
    calculateState() {
      let s = (this.value !== null);
      this.$emit('state', {id: this._uid, state: s});
      return s;
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'inputStyle.scss';
</style>
