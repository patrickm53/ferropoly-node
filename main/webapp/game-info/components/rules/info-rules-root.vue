<!---
  Rules and history
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.10.21
-->
<template lang="pug">
  div
    b-row
      b-col(sm="12")
        div(v-html="text")
    b-row
      b-col(sm="12")
        p &nbsp;
    b-row
      b-col(sm="12")
        h1 Änderungslog Spielregeln
        b-table(striped borderless small stacked="md" :items="changelog" :fields="fields" responsive="sm")
          template(#cell(changelog.version)="data") {{data.item.version}}
          template(#cell(changelog.date)="data") {{data.item.ts | formatDateTime}}
          template(#cell(changelog.changes)="data") {{data.item.changes}}
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatDateTime} from '../../../common/lib/formatters'
export default {
  name      : 'info-rules-root',
  props     : {},
  data      : function () {
    return {fields: [
        {key: 'changelog.version', label: '#'},
        {key: 'changelog.date', label: 'Datum'},
        {key: 'changelog.changes', label: 'Änderungen'}
      ]};
  },
  model     : {},
  created   : function () {
  },
  computed  : {
    ...mapFields([
      'gameplay.rules.text',
      'gameplay.rules.changelog',
    ]),
  },
  methods   : {},
  components: {},
  filters   : {formatDateTime},
  mixins    : []
}
</script>

<style lang="scss" scoped>

</style>
