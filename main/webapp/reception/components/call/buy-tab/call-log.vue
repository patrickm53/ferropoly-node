<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.01.22
-->
<template lang="pug">
  div
    #log-list
      b-table(
        :items="log"
        :fields="fields"
        small
        sort-by="ts"
        sort-desc
        thead-class="d-none"
        )
        template(#cell(ts)="data") {{data.item.ts | formatTime}}
        template(#cell(message)="data")
          b(v-if="data.item.title") {{data.item.title}}:&nbsp;
          span {{data.item.message}}

</template>

<script>
import { DateTime } from "luxon";
import {formatTime} from '../../../../common/lib/formatters';
import $ from 'jquery';
export default {
  name: "CallLog",
  components: {},
  filters   : {formatTime},
  mixins    : [],
  model     : {},
  props     : {
    logEntries: {
      type: Array,
      default: ()=>{
        return [];
      }
    }
  },
  data      : function () {
    return {
      logList: [],
      fields: [
        {key: 'ts', sortable: true, tdClass: 'ts-row'},
        {key: 'message'}
      ]
    };
  },
  computed  : {
    log() {
      return this.logEntries || this.logList;
    }
  },
  mounted   : function () {
    this.resizeHandler();
  },
  created   : function () {
    this.resizeHandler();
  },
  methods   : {
    pushErrorMessage(msg) {
      let info = {ts: DateTime.now().toISOTime(), title:'Fehler', message: msg, _rowVariant: 'danger'};
      console.log('error message', info);
      this.logList.push(info);
    },
    pushInfoMessage(msg) {
      this.logList.push({ts: DateTime.now().toISOTime(), message: msg});
    },
    pushSuccessMessage(msg) {
      this.logList.push({ts: DateTime.now().toISOTime(), title:'Erfolg', message: msg, _rowVariant: 'success'});
    },
    /**
     * Creates the maximum Size of the list
     */
    resizeHandler() {
      let element       = $('#log-list');
      let parent        = $('#log');
      let parentHeight  = parent.height();
      let parentOffset  = parent.offset();
      let offsetElement = element.offset();
      console.log('rhd', parentHeight, offsetElement, parentOffset);
      if (offsetElement && parentOffset) {
        element.height(parentHeight - (offsetElement.top - parentOffset.top));
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.ts-row {
  max-width: 10%;
  color: pink;
}

#log-list {
  overflow: auto;
  height: 200px;
}
</style>
