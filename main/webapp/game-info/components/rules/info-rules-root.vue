<!---
  Rules and history
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.10.21
-->
<template lang="pug">
  div
    div(v-if="finalized")
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
    div(v-if="!finalized")
      b-jumbotron(:header="gamename" lead="Die Spielregeln sind noch nicht ganz fertig. Komme später wieder vorbei!" )
        p &nbsp;
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {formatDateTime} from '../../../common/lib/formatters'

export default {
  name    : 'InfoRulesRoot',
  filters : {formatDateTime},
  model   : {},
  props   : {},
  data    : function () {
    return {
      fields: [
        {key: 'changelog.version', label: '#'},
        {key: 'changelog.date', label: 'Datum'},
        {key: 'changelog.changes', label: 'Änderungen'}
      ]
    };
  },
  computed: {
    ...mapFields({
      gamename : 'gameplay.gamename',
      text     : 'gameplay.rules.text',
      changelog: 'gameplay.rules.changelog',
      finalized: 'gameplay.internal.finalized'
    }),
  },
  methods : {},


}
</script>

<style lang="scss" scoped>

</style>
