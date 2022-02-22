<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.02.22
-->
<template lang="pug">
  div
    b-form-group(label="Orte auf Karte anzeigen:" v-slot="{ ariaDescribedby }")
      b-form-radio-group(
        v-model="selected"
        :options="options"
        :aria-describedby="ariaDescribedby"
        name="radio-inline"
        @change="onRadioChanged"
      )

</template>

<script>
export default {
  name      : 'PropertyDisplaySelector',
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      selected: 'free',
      options : [
        {text: 'freie', value: 'free'},
        {text: 'dem Team gehörend', value: 'own'},
        {text: 'alle', value: 'all'}
      ]
    };
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    onRadioChanged(e) {
      console.log('Radio changed', e, this.selected);
      this.$emit('change', this.selected);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
