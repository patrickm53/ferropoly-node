<!---
  A ferropoly styled card
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 26.07.21
-->
<template lang="pug">
  #ferro-card
    b-card(no-body).ferro-card
      b-card-header.title(:class="{'sm-title': isSm}")
        p.alignleft {{title}}
        p.alignright
          slot(name="controls")
      b-card-body(:class="{'sm-card-body': isSm}")
        b-card-text
          b-container(fluid="true")
            slot

</template>

<script>
export default {
  name      : 'FerroCard',
  components: {},
  filters   : {},
  model     : {},
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
  computed  : {
    isMd() {
      return this.size === 'md';
    },
    isSm() {
      return this.size === 'sm';
    }
  },
  created   : function () {
  },
  methods   : {}
}
</script>

<style lang="scss" scoped>
.title {
  font-weight: bold;
}

// Small Title
.sm-title {
  padding: 6px 10px;
}

// Small Card Body
.sm-card-body {
  padding: 6px 10px;
}

.ferro-card {
  margin-bottom: 10px;
}

.header-right {
  text-align: end;
  width: 100%;
  display: inline;
}

.alignleft {
  float: left;
  margin: 0;
}

.alignright {
  float: right;
  margin: 0;
}
</style>
