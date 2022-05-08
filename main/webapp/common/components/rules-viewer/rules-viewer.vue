<!---
  Rules viewer
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 28.04.21
-->
<template lang="pug">
  #rules-viewer
    b-col.ml-auto.mr-auto(sm="12" md="10" lg="6")
      div(v-html="rules.text")

</template>

<script>
import $ from 'jquery';
export default {
  name      : 'RulesViewer',
  components: {},
  filters   : {},
  model     : {},
  props     : {
    rules: {
      type: Object,
      default: () => {
        return {
          text: ''
        }
      }
    }
  },
  data      : function () {
    return {};
  },
  computed  : {},
  mounted: function () {
    this.resizeHandler();
  },
  created   : function () {
    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler();
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeHandler);
  },
  methods   : {
    /**
     * Creates the maximum Size of the list
     */
    resizeHandler() {
      let element       = $('#rules-viewer');
      let hDoc          = $(window).height();
      let offsetElement = element.offset();
      if (offsetElement) {
        element.height(hDoc - offsetElement.top);
      }
    }
  }
}
</script>

<style scoped>
#rules-viewer {
  overflow: auto;
  height: 200px;
}
@media print {
  body, html, #rules-viewer {
    height: 100% !important;
    width: 100% !important;
    display: inline-block;
  }
}
</style>
