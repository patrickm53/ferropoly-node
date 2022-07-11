<!---
  Ferropoly Navigation Bar
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.22
-->
<template lang="pug">
  div
    b-nav(tabs)
      b-nav-item(v-for="e in elements" :key="e.title"
        :active="e.active"
        @click="onClick(e)"
        ) {{e.title}}
  
</template>

<script>
export default {
  name: "FerroNav",
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    elements   : {
      // Elements of the nav bar. Contains different types of elements
      type   : Array,
      default: function () {
        return [];
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
    onClick(e) {
      console.log('click', e);
      this.elements.forEach(ele => {
        ele.active = (ele.title === e.title);
        if (ele.active && e.event) {
          this.$emit(e.event, e.eventParam);
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
