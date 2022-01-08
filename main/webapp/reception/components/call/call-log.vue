<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.01.22
-->
<template lang="pug">
  div
    b-table(
      :items="log"
      :fields="fields"
      small
      sort-by="ts"
      sort-desc
      thead-class="d-none"
      )
      template(#cell(ts)="data") {{data.item.ts | formatTime}}
  
</template>

<script>
import { DateTime } from "luxon";
import {formatTime} from '../../../common/lib/formatters';
export default {
  name: "CallLog",
  components: {},
  filters   : {formatTime},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      log: [],
      fields: [
        {key: 'ts', sortable: true, tdClass: 'ts-row'},
        {key: 'message'}
      ]
    };
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    pushErrorMessage(msg) {
      let info = {ts: DateTime.now().toISOTime(), message: msg, _rowVariant: 'danger'};
      console.log('error message', info);
      this.log.push(info);
    },
    pushInfoMessage(msg) {
      this.log.push({ts: DateTime.now().toISOTime(), message: msg});
    },
    pushSuccessMessage(msg) {
      this.log.push({ts: DateTime.now().toISOTime(), message: msg, _rowVariant: 'success'});
    }
  }
}
</script>

<style lang="scss" scoped>
.ts-row {
  max-width: 10%;
  color: pink;
}
</style>
