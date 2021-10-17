<!---
  A ferropoly styled card
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 26.07.21
-->
<template lang="pug">
  #ferro-card
    b-card(no-body).ferro-card
      b-card-header.title(:class="{'sm-title': isSm}") {{title}}
      b-card-body(:class="{'sm-card-body': isSm}")
        b-card-text
          b-container(fluid="true")
            slot

</template>

<script>
export default {
  name      : 'ferro-card',
  props     : {
    title: {
      type   : String,
      default: function () {
        return 'Ferropoly';
      }
    },
    size : {
      type   : String,
      default: function () {
        return 'md';
      }
    }
  },
  data      : function () {
    return {};
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    isMd() {
      return this.size === 'md';
    },
    isSm() {
      return this.size === 'sm';
    }
  },
  methods   : {},
  components: {},
  filters   : {}
}
</script>

<style lang="scss" scoped>
.title {
  font-weight: bold;
}

// Small Title
.sm-title {
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 10px;
  padding-right: 10px;
}

// Small Card Body
.sm-card-body {
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 10px;
  padding-right: 10px;
}

.ferro-card {
  margin-bottom: 10px;
}
</style>
