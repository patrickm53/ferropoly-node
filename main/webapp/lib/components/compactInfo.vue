<!---
  A compact info with a title and a text on the following line
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.03.23
-->
<template lang="pug">
div
  .compact-title {{title}}
  slot.entry
</template>

<script>
export default {
  name: "CompactInfo",
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    title: {
      type: String,
      default: () => {
        return '';
      }
    },
    text : {
      type: String,
      default: () => {
        return '';
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {},
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>
.compact-title {
  background-color: #c6c9c9;
  padding-left: 4px;
}
.entry {
  border-color: rgba(169, 168, 196, 0.99);
  border-bottom: 4px;
  padding-left: 3px;
}
</style>
