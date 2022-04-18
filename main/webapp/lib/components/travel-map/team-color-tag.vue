<!---
  A colored block
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.02.22
-->
<template lang="pug">
  font#color-tag(:style="cssVars")  &#9608
</template>

<script>
export default {
  name: "TeamColorTag",
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    color: {
      type:String,
      default: ()=> {
        return 'purple';
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {
    cssVars() {
      return {
        '--team-color': this.color
      }
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>
#color-tag {
  color: var(--team-color);
}
</style>
