<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.01.22
-->
<template lang="pug">
  div
    b-input-group(size='sm')
      b-form-input(
        v-model="gamblingValue"
        type="number"
        number=true
        step="500"
        :min="min"
        :max="max"
      )
      b-input-group-append
        b-button(variant="success" @click="onWinning") Gewinn
        b-button(variant="danger" @click="onLoosing") Verlust

</template>

<script>
export default {
  name      : 'GamblingControls',
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    min: {
      type: String,
      default: '1'
    },
    max: {
      type: String,
      default: '5000'
    }
  },
  data      : function () {
    return {
      gamblingValue: this.min
    };
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    onWinning() {
      if (this.gamblingValue > 0) {
        console.log('luckily wins', this.gamblingValue);
        this.$emit('win', this.gamblingValue)
      }
      this.gamblingValue = this.min;
    },
    onLoosing() {
      if (this.gamblingValue > 0) {
        console.log('poor sod looses', this.gamblingValue);
        this.$emit('loose', this.gamblingValue)
      }
      this.gamblingValue = this.min;
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
