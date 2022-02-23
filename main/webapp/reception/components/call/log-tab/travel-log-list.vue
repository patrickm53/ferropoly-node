<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 23.02.22
-->
<template lang="pug">
  #travel-log
    b-table(
      :items="travelLog"
      :fields="fields"
      small=true
      @row-clicked="onPositionSelected"
    )
      template(#cell(ts)="data") {{formatTime(data.item.ts)}}

</template>

<script>
import {formatTime} from '../../../../common/lib/formatters';
import $ from 'jquery';

export default {
  name      : 'TravelLogList',
  components: {},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {
    travelLog: {
      type   : Array,
      default: () => {
        return [];
      }
    }
  },
  data      : function () {
    return {
      fields: [
        {key: 'ts', label: 'Zeit'},
        {key: 'name', label: 'Ort'}
      ]
    };
  },
  computed  : {},
  mounted   : function () {
    this.resizeHandler();
  },
  created   : function () {
    window.addEventListener('resize', this.resizeHandler);
    this.resizeHandler();
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeHandler);
  },
  methods: {
    formatTime(t) {
      return formatTime(t);
    },
    onPositionSelected(item) {
      console.log('click', item);
    },
    /**
     * Creates the maximum Size of the list
     */
    resizeHandler() {
      let element       = $('#travel-log');
      let hDoc          = $(window).height();
      let offsetElement = element.offset();
      console.log('rh', hDoc, offsetElement);
      if (offsetElement) {
        element.height(hDoc - offsetElement.top - 10);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#travel-log {
  overflow: auto;
  height: 200px;
  cursor: pointer;
}
</style>
