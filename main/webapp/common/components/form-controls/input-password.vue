<!---
  Password input for Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 17.10.22
-->
<template lang="pug">
  div.form-input-start
    label.input-label(:for="id" v-if="label") {{label}}
    b-form-group
      b-input-group
        b-form-input(
          :type="type"
          :id="id"
          :value="value"
          :state="state"
          :disabled="disabled"
          @input="update"
          trim=true
          aria-describedby="input-help input-feedback"
        )
        b-input-group-append
          b-button(@click="togglePasswordVisiblity" variant="dark")
            font-awesome-icon.no-url(v-if="type==='password'" icon="fa-solid fa-eye")
            font-awesome-icon.no-url(v-if="type==='text'" icon="fa-solid fa-eye-slash")
    b-form-invalid-feedback(v-if="feedback") {{feedback}}
    b-form-text(v-if="help") {{help}}

</template>

<script>
import InputMixin from './inputMixin.js'
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core';
library.add(faEye);
library.add(faEyeSlash);

export default {
  name      : 'InputPassword',
  components: {FontAwesomeIcon},
  filters   : {},
  mixins    : [InputMixin],
  model     : {},
  props     : {
    value : {
      type   : String,
      default: () => {
        return '';
      }
    }, min: {
      type   : String,
      default: () => {
        return '0';
      }
    },
    max   : {
      type   : String,
      default: () => {
        return '100';
      }
    },
    state : {
      type   : Boolean,
      default: () => {
        return undefined;
      }
    }
  },
  data      : function () {
    return {
      type: 'password'
    };
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    update(e) {
      this.$emit('input', e);
    },
    togglePasswordVisiblity() {
      if (this.type === 'text') {
        this.type = 'password'
      } else {
        this.type = 'text';
      }
    },

  }
}
</script>

<style lang="scss" scoped>
@import 'inputStyle.scss';
</style>
